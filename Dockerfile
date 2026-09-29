# syntax=docker/dockerfile:1

###############################################################################
# Stage 1 — Build frontend assets (React + TypeScript + Vite)
#
# VITE_* variables are intentionally not set here. At build time there is no
# .env, so Vite inlines no Reverb credentials and bootstrap.ts skips creating
# the Echo connection entirely — which is what we want for a demo, since Reverb
# needs a public TCP port that Render's free plan does not provide.
###############################################################################
FROM node:22-alpine AS frontend
WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-audit

COPY vite.config.js tsconfig.json ./
COPY resources ./resources
RUN npm run build

###############################################################################
# Stage 2 — PHP base, shared by the vendor and runtime stages
#
# The extensions are compiled exactly once here and inherited by both stages,
# so Composer resolves dependencies against the same PHP build and the same
# extension set that will actually serve requests. That is deliberate:
#
#   * Composer used to run in the `composer:2` image, but that tag is floating
#     and has moved to PHP 8.5, while phpoffice/phpspreadsheet requires
#     "php >=7.4.0 <8.5.0". The build failed on the platform check. Only the
#     composer *binary* is copied from that image now — it is a phar and is
#     happy on any PHP 8.x, so tag drift there cannot break the build again.
#   * It also means no --ignore-platform-req is needed. Every extension the
#     lock file requires is genuinely present, so Composer's own check is a
#     real check.
#
# php:8.4-cli-alpine already ships ctype, curl, dom, fileinfo, filter, hash,
# iconv, json, libxml, mbstring, openssl, pcre, PDO, pdo_sqlite, Phar,
# session, SimpleXML, sodium, tokenizer, xml, xmlreader, xmlwriter, zlib and
# opcache. Only gd, zip and pdo_mysql have to be added.
#
# The runtime libraries (libjpeg-turbo, libpng, freetype, libzip) are listed
# as explicit packages *before* the virtual .build-deps group, not after it.
# Otherwise apk treats them as auto-installed dependencies of the -dev
# packages and `apk del .build-deps` removes them — gd.so and zip.so then fail
# to load at startup with no error, and Composer cannot see the extensions.
# The extension check below is what caught that.
###############################################################################
FROM php:8.4-cli-alpine AS php-base
RUN apk add --no-cache sqlite \
    && apk add --no-cache libjpeg-turbo libpng freetype libzip \
    && apk add --no-cache --virtual .build-deps \
        $PHPIZE_DEPS \
        libjpeg-turbo-dev \
        libpng-dev \
        libzip-dev \
        freetype-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" gd zip pdo_mysql \
    && apk del .build-deps \
    && rm -rf /tmp/*

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

# opcache is useless without a persistent process and only adds memory
# pressure on a 512 MB free instance, so keep it off.
COPY docker/php.ini /usr/local/etc/php/conf.d/zz-app.ini

# Fail the build — not the first HTTP request — if an extension the app
# actually needs is missing. This is the authoritative check; Composer's
# platform check is a useful second opinion.
RUN set -e; \
    missing=""; \
    for ext in dom mbstring json ctype filter hash openssl session tokenizer \
               fileinfo zlib gd iconv libxml simplexml xml xmlreader \
               xmlwriter zip curl pcre phar pdo_mysql pdo_sqlite; do \
        php -r "exit(extension_loaded('$ext') ? 0 : 1);" \
            || missing="$missing $ext"; \
    done; \
    if [ -n "$missing" ]; then \
        echo "FATAL: missing PHP extensions:$missing" >&2; \
        exit 1; \
    fi; \
    php -v

###############################################################################
# Stage 3 — Install PHP dependencies (Composer)
#
# Production dependencies only, and no scripts on the first pass so package
# discovery does not run before the autoloader exists.
###############################################################################
FROM php-base AS vendor
WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
        --no-dev \
        --no-scripts \
        --no-autoloader \
        --prefer-dist \
        --no-interaction \
        --no-progress

COPY . .
# Compiled front-end assets land in the final image, so bake them in here too
# and keep public/build out of the git working copy.
COPY --from=frontend /app/public/build ./public/build
RUN composer install \
        --no-dev \
        --optimize-autoloader \
        --no-interaction \
        --no-progress

###############################################################################
# Stage 4 — Runtime
#
# Deliberately minimal: PHP's built-in server handles HTTP directly, so there
# is no nginx, no PHP-FPM, and no supervisord. The previous setup ran four
# processes behind a supervisor and a port-templated nginx config, which is
# where most of the earlier deploy failures came from.
#
# config:cache is intentionally NOT run. Render supplies env vars at runtime,
# not build time, so a config cache baked into the image would freeze stale
# values (DB, APP_KEY) into every request.
###############################################################################
FROM php-base AS runtime
WORKDIR /var/www/html

# App source + production vendor + built assets from stage 3.
COPY --from=vendor /app /var/www/html

COPY docker/start.sh /usr/local/bin/start
RUN chmod +x /usr/local/bin/start \
    && mkdir -p \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/views \
        storage/framework/testing \
        storage/logs \
        bootstrap/cache \
        database

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/start"]
