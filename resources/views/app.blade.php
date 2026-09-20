<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'TaskManager') }}</title>

        <!-- Theme -->
        <script>
            (function () {
                const stored = localStorage.getItem('theme');
                const prefersDark = window.matchMedia(
                    '(prefers-color-scheme: dark)',
                ).matches;
                document.documentElement.classList.toggle(
                    'dark',
                    stored === 'dark' || (!stored && prefersDark),
                );
            })();
        </script>

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
