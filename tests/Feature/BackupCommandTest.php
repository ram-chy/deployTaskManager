<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BackupCommandTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        foreach (glob(storage_path('app/backups/backup-*.sql')) as $file) {
            @unlink($file);
        }

        parent::tearDown();
    }

    public function test_command_prunes_old_backups_and_keeps_latest(): void
    {
        $directory = storage_path('app/backups');

        if (! is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        foreach (['2026-01-01-010000', '2026-01-02-010000', '2026-01-03-010000'] as $timestamp) {
            touch($directory.'/backup-'.$timestamp.'.sql');
        }

        touch($directory.'/backup-2026-01-04-010000.sql');
        touch($directory.'/backup-2026-01-05-010000.sql');

        $this->artisan('backup:database', ['--keep' => 2])
            ->expectsOutputToContain('Skipping dump')
            ->expectsOutputToContain('Pruned 3 old backup(s).')
            ->assertSuccessful();

        $remaining = array_map('basename', glob($directory.'/backup-*.sql'));

        $this->assertCount(2, $remaining);
        $this->assertContains('backup-2026-01-05-010000.sql', $remaining);
        $this->assertContains('backup-2026-01-04-010000.sql', $remaining);
        $this->assertNotContains('backup-2026-01-01-010000.sql', $remaining);
    }

    public function test_command_fails_gracefully_when_mysqldump_is_missing(): void
    {
        $default = config('database.default');
        $mysql = config('database.connections.mysql');
        $binary = config('database.backup.mysqldump');

        config([
            'database.default' => 'mysql',
            'database.connections.mysql' => [
                'driver' => 'mysql',
                'host' => '127.0.0.1',
                'port' => '3307',
                'database' => 'flexmania',
                'username' => 'root',
                'password' => '',
            ],
            'database.backup.mysqldump' => 'C:\\does-not-exist\\mysqldump.exe',
        ]);

        try {
            $this->artisan('backup:database')
                ->expectsOutputToContain('mysqldump binary not found')
                ->assertExitCode(1);
        } finally {
            config([
                'database.default' => $default,
                'database.connections.mysql' => $mysql,
                'database.backup.mysqldump' => $binary,
            ]);
        }

        $this->assertSame([], glob(storage_path('app/backups/backup-*.sql')) ?: []);
    }
}
