<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([RoleSeeder::class]);

        $demoUsers = [
            ['name' => 'Admin', 'email' => 'admin@taskmanager.local', 'role' => 'admin'],
            ['name' => 'Manager', 'email' => 'manager@taskmanager.local', 'role' => 'manager'],
            ['name' => 'Staff', 'email' => 'staff@taskmanager.local', 'role' => 'staff'],
        ];

        foreach ($demoUsers as $demo) {
            $user = User::firstOrCreate(
                ['email' => $demo['email']],
                ['name' => $demo['name'], 'password' => 'password'],
            );

            $user->syncRoles($demo['role']);

            $this->command->info(sprintf(
                'Demo user created: %s / password (role: %s)',
                $demo['email'],
                $demo['role'],
            ));
        }

        $this->call([CustomerSeeder::class, TaskSeeder::class]);
    }
}
