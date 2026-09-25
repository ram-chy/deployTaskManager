# syntax=docker/dockerfile:1

###############################################################################
# Stage 1 — Build frontend assets (React + TypeScript + Vite)
###############################################################################
FROM node:22-alpine AS frontend
WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY vite.config.js tsconfig.json ./
COPY resources ./resources
RUN npm run build

###############################################################################
# Stage 2 — Install PHP dependencies (Composer)
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
        --no-progress \
        --ignore-platform-reqs

COPY . .

RUN composer install \
        --no-dev \
        --optimize-autoloader \
        --no-interaction \
        --no-progress \
        --ignore-platform-reqs

###############################################################################
# Stage 3 — Runtime: Nginx + PHP-FPM 8.4 + Supervisor
###############################################################################
FROM php:8.4-fpm AS runtime

ENV DEBIAN_FRONTEND=noninteractive

# System packages + PHP extensions
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        nginx \
        ca-certificates \
        curl \
        supervisor \
        unzip \
        default-mysql-client \
        libfreetype-dev \
        libjpeg-dev \
        libpng-dev \
        libsqlite3-dev \
        libzip-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql pdo_sqlite gd zip opcache \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /var/log/apt \
    && mkdir -p \
        /var/www/html/storage/framework/cache/data \
        /var/www/html/storage/framework/sessions \
        /var/www/html/storage/framework/views \
        /var/www/html/storage/framework/testing \
        /var/www/html/storage/logs \
        /var/www/html/bootstrap/cache

WORKDIR /var/www/html

# App + assets
COPY --from=vendor /app /var/www/html
COPY --from=frontend /app/public/build /var/www/html/public/build

# Server configuration
COPY docker/deploy/nginx.conf       /etc/nginx/sites-available/default
COPY docker/deploy/supervisord.conf /etc/supervisor/supervisord.conf
COPY docker/deploy/entrypoint.sh    /usr/local/bin/docker-entrypoint.sh
COPY docker/deploy/reverb.conf.tpl  /docker/deploy/reverb.conf.tpl

RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
    && chown -R www-data:www-data \
        /var/www/html/storage \
        /var/www/html/bootstrap/cache \
        /var/www/html/public

EXPOSE 80

ENTRYPOINT ["docker-entrypoint.sh"]