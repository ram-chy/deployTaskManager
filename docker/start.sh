#!/bin/sh
# Container entrypoint: prepare the app, then hand off to PHP's built-in
# server. Kept deliberately short so there is little to go wrong at boot.
set -eu

APP_DIR=${APP_DIR:-/var/www/html}
cd "$APP_DIR"

# ---------------------------------------------------------------------------
# 1. Normalise APP_KEY.
#
# Render's `generateValue: true` emits a raw base64 string with no "base64:"
# prefix. Laravel treats an unprefixed value as a literal cipher key, and
# AES-256-CBC needs exactly 16 or 32 bytes, so a raw 43-character value makes
# every request fail with "Unsupported cipher or incorrect key length".
#
# The derivation is deterministic (a hash of the incoming value) on purpose: a
# fresh random key each boot would invalidate all sessions and cookies.
# ---------------------------------------------------------------------------
if [ -z "${APP_KEY:-}" ]; then
    echo "-> No APP_KEY supplied, generating one ..."
    APP_KEY="$(php artisan key:generate --show 2>/dev/null | tr -d '\r' | tail -n1)"
fi

NORMALISED_KEY="$(APP_KEY="$APP_KEY" php -r '
$key = (string) getenv("APP_KEY");
$payload = str_starts_with($key, "base64:") ? substr($key, 7) : "";
$decoded = $payload === "" ? false : base64_decode($payload, true);
$usable = is_string($decoded) && in_array(strlen($decoded), [16, 32], true);
echo $usable ? $key : "base64:" . base64_encode(hash("sha256", $key, true));
')"

if [ "$NORMALISED_KEY" != "${APP_KEY:-}" ]; then
    echo "-> APP_KEY normalised to a Laravel-compatible base64: key"
fi
export APP_KEY="$NORMALISED_KEY"

# ---------------------------------------------------------------------------
# 2. Bind the app URL to the public hostname.
#
# Without this Laravel builds asset/redirect URLs from APP_URL, which defaults
# to http://localhost and breaks every link and Vite asset on a real domain.
# ---------------------------------------------------------------------------
if [ -n "${RENDER_EXTERNAL_URL:-}" ]; then
    export APP_URL="${RENDER_EXTERNAL_URL}"
    echo "-> APP_URL=${APP_URL}"
fi

# ---------------------------------------------------------------------------
# 3. Reverb needs a public TCP port, which free plans do not provide.
# ---------------------------------------------------------------------------
export BROADCAST_CONNECTION="${BROADCAST_CONNECTION:-null}"

# ---------------------------------------------------------------------------
# 4. Prepare the database.
#
# Free instances are ephemeral, so SQLite is rebuilt from scratch on every
# boot. Migrations and seeders are both idempotent.
# ---------------------------------------------------------------------------
if [ "${DB_CONNECTION:-sqlite}" = "sqlite" ]; then
    SQLITE_FILE="${DB_DATABASE:-${APP_DIR}/database/database.sqlite}"
    mkdir -p "$(dirname "$SQLITE_FILE")"
    [ -f "$SQLITE_FILE" ] || touch "$SQLITE_FILE"
    echo "-> Using SQLite at ${SQLITE_FILE}"
fi

echo "-> Running migrations ..."
php artisan migrate --force --no-interaction

if [ "${APP_SEED_DEMO:-false}" = "true" ]; then
    echo "-> Seeding demo data ..."
    php artisan db:seed --force --no-interaction
fi

php artisan storage:link --quiet 2>/dev/null || true

# PHP's built-in server runs as root inside the container, so no chown of
# storage/ is needed here the way it was when PHP-FPM ran as www-data.

# ---------------------------------------------------------------------------
# 5. Serve.
#
# Render injects PORT (default 10000) and routes traffic to 0.0.0.0:$PORT only.
# PHP_CLI_SERVER_WORKERS forks multiple workers so concurrent asset requests
# are not serialised behind a single-threaded server.
#
# The router argument MUST be server.php, not public/index.php. The built-in
# server calls the router for every request, so pointing it straight at the
# front controller makes PHP return the HTML shell for asset requests too --
# a 200 with text/html where app.js was expected, and a blank page in the
# browser. server.php returns false for files that exist so the server
# streams them itself. (Laravel 11 dropped the bundled copy, so this repo
# ships its own.)
# ---------------------------------------------------------------------------
HTTP_PORT="${PORT:-80}"
echo "-> Starting TaskManager on 0.0.0.0:${HTTP_PORT}"
export PHP_CLI_SERVER_WORKERS="${PHP_CLI_SERVER_WORKERS:-4}"

exec php -S "0.0.0.0:${HTTP_PORT}" -t public server.php
