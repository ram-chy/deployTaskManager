<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BackupCommandTest extends TestCase
{
    use RefreshDatabase;

    private string $backupDirectory;

    protected function setUp(): void
    {
        parent::setUp();

        $this->backupDirectory = sys_get_temp_dir().'/flexmania-backup-test-'.uniqid();
        mkdir($this->backupDirectory, 0777, true);

        config(['database.backup.path' => $this->backupDirectory]);
    }

    protected function tearDown(): void
    {
        foreach (glob($this->backupDirectory.'/backup-*.sql') ?: [] as $file) {
            @unlink($file);
        }

        @rmdir($this->backupDirectory);

        parent::tearDown();
    }

    public function test_command_prunes_old_backups_and_keeps_latest(): void
    {
        foreach (['2026-01-01-010000', '2026-01-02-010000', '2026-01-03-010000'] as $timestamp) {
            touch($this->backupDirectory.'/backup-'.$timestamp.'.sql');
        }

        touch($this->backupDirectory.'/backup-2026-01-04-010000.sql');
        touch($this->backupDirectory.'/backup-2026-01-05-010000.sql');

        $this->artisan('backup:database', ['--keep' => 2])
            ->expectsOutputToContain('Skipping dump')
            ->expectsOutputToContain('Pruned 3 old backup(s).')
            ->assertSuccessful();

        $remaining = array_map('basename', glob($this->backupDirectory.'/backup-*.sql'));

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
        $path = config('database.backup.path');

        config([
            'database.default' => 'mysql',
            'database.connections.mysql' => [
                'driver' => 'mysql',
                'host' => '127.0.0.1',
                'port' => '3306',
                'database' => 'flexmania',
                'username' => 'root',
                'password' => '',
            ],
            'database.backup.mysqldump' => 'C:\\does-not-exist\\mysqldump.exe',
            'database.backup.path' => $this->backupDirectory,
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
                'database.backup.path' => $path,
            ]);
        }

        $this->assertSame([], glob($this->backupDirectory.'/backup-*.sql') ?: []);
    }
}
