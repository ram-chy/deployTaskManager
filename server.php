<?php

/**
 * Router script for PHP's built-in web server.
 *
 * Laravel 11 removed the bundled server.php, but the built-in server still
 * needs one when you point it at a router. This is the same file Laravel
 * used to ship.
 *
 * The built-in server invokes the router for EVERY request, so it has to hand
 * back `false` for existing static files to let the server stream them
 * itself. Without that, requests for /build/assets/*.js fall through to
 * public/index.php, Laravel returns the HTML shell with a 200, and the
 * browser gets an empty page with no JavaScript or CSS.
 */

$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? ''
);

// Never serve directory listings; let Laravel handle those routes.
if ($uri !== '/' && ! str_ends_with($uri, '/') && file_exists(__DIR__.'/public'.$uri)) {
    return false;
}

require_once __DIR__.'/public/index.php';
