<?php

use App\Http\Middleware\EnsureUserHasRole;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Session\TokenMismatchException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        channels: __DIR__.'/../routes/channels.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withSchedule(function (Schedule $schedule): void {
        $schedule->command('backup:database')->dailyAt('02:00');
    })
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => EnsureUserHasRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        $renderInertiaError = function (int $status, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return null;
            }

            return inertia('errors/error', ['status' => $status])
                ->toResponse($request)
                ->setStatusCode($status);
        };

        $exceptions->render(
            function (HttpExceptionInterface $e, Request $request) use ($renderInertiaError) {
                return $renderInertiaError($e->getStatusCode(), $request);
            }
        );

        $exceptions->render(
            function (TokenMismatchException $e, Request $request) use ($renderInertiaError) {
                return $renderInertiaError(419, $request);
            }
        );
    })->create();
