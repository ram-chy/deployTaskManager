#!/usr/bin/env sh
set -eu

APP_DIR="/var/www/html"
cd "$APP_DIR"

# ---------------------------------------------------------------------------
# 1. Ensure an APP_KEY exists (generate one at boot when missing)
# ---------------------------------------------------------------------------
if [ -z "${APP_KEY:-}" ]; then
    echo "-> Generating APP_KEY ..."
    APP_KEY="$(php artisan key:generate --show --ansi | tail -n1)"
    export APP_KEY
fi

# ---------------------------------------------------------------------------
# 2. Auto-detect the public URL on managed hosting (Render / Railway)
# ---------------------------------------------------------------------------
if [ -n "${RENDER_EXTERNAL_URL:-}" ]; then
    export APP_URL="${RENDER_EXTERNAL_URL}"
    echo "-> APP_URL=${APP_URL}"
fi

if [ -n "${RAILWAY_PUBLIC_DOMAIN:-}" ]; then
    export APP_URL="https://${RAILWAY_PUBLIC_DOMAIN}"
    echo "-> APP_URL=${APP_URL}"
fi

# ---------------------------------------------------------------------------
# 2b. Bind nginx to the platform-assigned port.
#
# Render injects PORT (default 10000) and only proxies traffic to 0.0.0.0:$PORT,
# so a hardcoded "listen 80" fails the health check there. Fall back to 80 for
# docker-compose and any host that does not set PORT.
# ---------------------------------------------------------------------------
HTTP_PORT="${PORT:-80}"
echo "-> Nginx listening on 0.0.0.0:${HTTP_PORT}"
sed -e "s|__PORT__|${HTTP_PORT}|g" \
    /docker/deploy/nginx.conf.tpl > /etc/nginx/sites-available/default

# ---------------------------------------------------------------------------
# 3. Prepare the database (wait for MySQL, or bootstrap a SQLite file)
# ---------------------------------------------------------------------------
CONNECTION="${DB_CONNECTION:-mysql}"

if [ "${CONNECTION}" = "mysql" ]; then
    echo "-> Waiting for MySQL at ${DB_HOST:-127.0.0.1}:${DB_PORT:-3306} ..."
    php -r '
        $h = getenv("DB_HOST") ?: "127.0.0.1";
        $p = getenv("DB_PORT") ?: "3306";
        $u = getenv("DB_USERNAME") ?: "root";
        $pw = getenv("DB_PASSWORD") ?: "";
        $ok = false;
        for ($i = 0; $i < 90; $i++) {
            try { new PDO("mysql:host=$h;port=$p", $u, $pw); $ok = true; break; }
            catch (Throwable $e) { sleep(2); }
        }
        if (!$ok) { fwrite(STDERR, "Could not connect to MySQL.\n"); exit(1); }
    '
elif [ "${CONNECTION}" = "sqlite" ]; then
    echo "-> Using SQLite ..."
    SQLITE_FILE="${DB_DATABASE:-${APP_DIR}/database/database.sqlite}"
    mkdir -p "$(dirname "$SQLITE_FILE")"
    [ -f "$SQLITE_FILE" ] || touch "$SQLITE_FILE"
fi

# ---------------------------------------------------------------------------
# 4. Migrations + optional demo data
# ---------------------------------------------------------------------------
# Broadcasting needs a running Reverb/Pusher server. Disable it unless the
# demo explicitly enables the Reverb process (START_REVERB=true).
if [ "${START_REVERB:-false}" != "true" ]; then
    export BROADCAST_CONNECTION="null"
fi

echo "-> Running migrations ..."
php artisan migrate --force --no-interaction

if [ "${APP_SEED_DEMO:-false}" = "true" ]; then
    echo "-> Seeding demo data ..."
    php artisan db:seed --force --no-interaction
fi

php artisan storage:link --quiet 2>/dev/null || true

# PHP-FPM runs as www-data. Ensure the (SQLite) database and runtime dirs
# created by the root-run migrations above are writable by it.
chown -R www-data:www-data \
    storage \
    bootstrap/cache \
    "$(dirname "${DB_DATABASE:-${APP_DIR}/database/database.sqlite}")" \
    2>/dev/null || true

# ---------------------------------------------------------------------------
# 5. Optional Reverb push server (enabled with START_REVERB=true)
# ---------------------------------------------------------------------------
REVERB_CONF="/etc/supervisor/conf.d/reverb.conf"
if [ "${START_REVERB:-false}" = "true" ]; then
    echo "-> Enabling Reverb broadcast server ..."
    sed -e "s|__APP_DIR__|${APP_DIR}|g" \
        /docker/deploy/reverb.conf.tpl > "${REVERB_CONF}"
else
    printf '# Reverb disabled\n' > "${REVERB_CONF}"
fi

# ---------------------------------------------------------------------------
# 6. Start the application
# ---------------------------------------------------------------------------
echo "-> Starting TaskManager (nginx + php-fpm + queue worker) ..."
exec /usr/bin/supervisord -c /etc/supervisor/supervisord.conf