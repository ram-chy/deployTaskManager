<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

abstract class AbstractService
{
    /**
     * Log an exception at the service boundary.
     */
    protected function logError(string $context, \Throwable $e, array $extra = []): void
    {
        Log::error($context, array_merge([
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
        ], $extra));
    }
}
