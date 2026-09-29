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
# Stage 2 — Install PHP dependencies (Composer)
#
# Production dependencies only, and no scripts on the first pass so package
# discovery does not run before the autoloader exists.
###############################################################################
FROM composer:2 AS vendor
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
RUN composer install \
        --no-dev \
        --optimize-autoloader \
        --no-interaction \
        --no-progress

###############################################################################
# Stage 3 — Runtime
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
FROM php:8.4-cli-alpine AS runtime

RUN apk add --no-cache sqlite \
    && apk add --no-cache --virtual .build-deps \
        $PHPIZE_DEPS \
        libjpeg-turbo-dev \
        libpng-dev \
        libzip-dev \
        freetype-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" gd zip pdo_mysql pdo_sqlite opcache \
    && apk del .build-deps \
    && rm -rf /tmp/*

WORKDIR /var/www/html

# App source + production vendor from stage 2.
COPY --from=vendor /app /var/www/html
# Compiled front-end assets from stage 1, overwriting the empty public/build.
COPY --from=frontend /app/public/build /var/www/html/public/build

# opcache is useless without a persistent process and only adds memory
# pressure on a 512 MB free instance, so keep it off.
COPY docker/php.ini /usr/local/etc/php/conf.d/zz-app.ini
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
