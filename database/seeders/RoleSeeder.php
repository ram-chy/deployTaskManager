<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Seed the application's default roles.
     */
    public function run(): void
    {
        $roles = [
            ['name' => 'Admin', 'slug' => 'admin', 'description' => 'Full access to the system.'],
            ['name' => 'Manager', 'slug' => 'manager', 'description' => 'Manages team members and assignments.'],
            ['name' => 'Staff', 'slug' => 'staff', 'description' => 'Regular team member.'],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(['slug' => $role['slug']], $role);
        }
    }
}
