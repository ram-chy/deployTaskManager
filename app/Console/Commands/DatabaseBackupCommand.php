<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Process;
use Symfony\Component\Process\ExecutableFinder;

class DatabaseBackupCommand extends Command
{
    protected $signature = 'backup:database {--keep=7 : Number of backups to retain}';

    protected $description = 'Dump the MySQL database and prune old backups';

    public function handle(): int
    {
        $directory = config('database.backup.path', storage_path('app/backups'));
        $this->ensureDirectory($directory);

        $exitCode = 0;

        if (config('database.default') !== 'mysql') {
            $this->warn('Skipping dump: the default database connection is not MySQL.');
        } else {
            $exitCode = $this->dump($directory);
        }

        $this->prune($directory, (int) $this->option('keep'));

        return $exitCode;
    }

    protected function dump(string $directory): int
    {
        $mysqldump = $this->mysqldumpBinary();

        if ($mysqldump === null) {
            $this->error('mysqldump binary not found. Set MYSQLDUMP_PATH in .env or add it to PATH.');

            return 1;
        }

        $connection = config('database.connections.mysql');
        $command = array_filter([
            $mysqldump,
            '--no-defaults',
            '--host='.$connection['host'],
            '--port='.(string) $connection['port'],
            '--user='.$connection['username'],
            $connection['password'] !== '' ? '--password='.$connection['password'] : null,
            '--single-transaction',
            '--routines',
            '--no-tablespaces',
            $connection['database'],
        ]);

        $process = Process::newPendingProcess()->timeout(300)->run($command);

        if ($process->exitCode() !== 0) {
            $this->error('mysqldump failed: '.trim($process->errorOutput() ?: $process->output()));

            return 1;
        }

        $filename = 'backup-'.now()->format('Y-m-d-His').'.sql';
        file_put_contents($directory.'/'.$filename, $process->output());

        $this->info(sprintf('Database backed up to storage/app/backups/%s.', $filename));

        return 0;
    }

    protected function mysqldumpBinary(): ?string
    {
        $configured = config('database.backup.mysqldump');

        if (is_string($configured) && $configured !== '') {
            return is_file($configured) ? $configured : null;
        }

        return (new ExecutableFinder)->find('mysqldump');
    }

    protected function prune(string $directory, int $keep): void
    {
        $backups = collect(glob($directory.'/backup-*.sql'))
            ->sortDesc()
            ->values();

        $excess = $backups->slice($keep);

        foreach ($excess as $backup) {
            @unlink($backup);
        }

        if ($excess->isNotEmpty()) {
            $this->info(sprintf('Pruned %d old backup(s).', $excess->count()));
        }
    }

    protected function ensureDirectory(string $directory): void
    {
        if (! is_dir($directory)) {
            mkdir($directory, 0755, true);
        }
    }
}
