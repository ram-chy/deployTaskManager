<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    /**
     * Seed a handful of demo customers.
     */
    public function run(): void
    {
        $customers = [
            [
                'name' => 'Acme Corporation',
                'email' => 'hello@acme.example',
                'phone' => '+1 555 010 1234',
                'notes' => 'Primary client — prefers email communication.',
            ],
            [
                'name' => 'Globex Industries',
                'email' => 'contact@globex.example',
                'phone' => '+1 555 010 5678',
                'notes' => null,
            ],
            [
                'name' => 'Initech Ltd.',
                'email' => 'support@initech.example',
                'phone' => '+44 20 7946 0958',
                'notes' => 'Monthly reporting arrangement.',
            ],
            [
                'name' => 'Umbrella Systems',
                'email' => 'info@umbrella.example',
                'phone' => '+1 555 013 2486',
                'notes' => 'High-priority account.',
            ],
            [
                'name' => 'Stark Builders',
                'email' => 'projects@starkbuilders.example',
                'phone' => null,
                'notes' => null,
            ],
            [
                'name' => 'Wayne Logistics',
                'email' => 'ops@waynelogistics.example',
                'phone' => '+1 555 018 3351',
                'notes' => 'Onboarding call pending.',
            ],
            [
                'name' => 'Cyberdyne Solutions',
                'email' => 'sales@cyberdyne.example',
                'phone' => '+81 3 1234 5678',
                'notes' => null,
            ],
            [
                'name' => 'Stark Industries',
                'email' => 'billing@starkind.example',
                'phone' => '+1 555 019 8810',
                'notes' => 'Annual contract renewal in Q4.',
            ],
        ];

        foreach ($customers as $customer) {
            Customer::firstOrCreate(['email' => $customer['email']], $customer);
        }
    }
}
