<?php

use Illuminate\Support\Carbon;

if (! function_exists('format_date')) {
    /**
     * Format a date value using the application's date format.
     */
    function format_date(Carbon|string|null $date, string $format = 'd M, Y'): string
    {
        if (! $date) {
            return '-';
        }

        return Carbon::parse($date)->format($format);
    }
}

if (! function_exists('format_datetime')) {
    /**
     * Format a datetime value using the application's datetime format.
     */
    function format_datetime(Carbon|string|null $datetime, string $format = 'd M, Y h:i A'): string
    {
        if (! $datetime) {
            return '-';
        }

        return Carbon::parse($datetime)->format($format);
    }
}

if (! function_exists('time_ago')) {
    /**
     * Human readable relative time for a given datetime.
     */
    function time_ago(Carbon|string|null $datetime): string
    {
        if (! $datetime) {
            return '-';
        }

        return Carbon::parse($datetime)->diffForHumans();
    }
}
