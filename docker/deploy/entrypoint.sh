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
echo "-> Running migrations ..."
php artisan migrate --force --no-interaction

if [ "${APP_SEED_DEMO:-false}" = "true" ]; then
    echo "-> Seeding demo data ..."
    php artisan db:seed --force --no-interaction
fi

php artisan storage:link --quiet 2>/dev/null || true

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