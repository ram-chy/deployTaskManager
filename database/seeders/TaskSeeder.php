<?php

namespace Database\Seeders;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Models\Customer;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    /**
     * Seed a realistic set of demo tasks.
     */
    public function run(): void
    {
        $staff = User::where('email', 'staff@flexmania.local')->firstOrFail();
        $manager = User::where('email', 'manager@flexmania.local')->firstOrFail();
        $admin = User::where('email', 'admin@flexmania.local')->firstOrFail();
        $customers = Customer::orderBy('id')->get();

        $tasks = [
            [
                'title' => 'Prepare quarterly client report',
                'description' => 'Compile metrics and send the summary to Acme Corporation.',
                'status' => TaskStatus::SendForApprove,
                'priority' => TaskPriority::High,
                'due_date' => now()->addDays(2)->toDateString(),
                'assignee_id' => $staff->id,
                'customer_id' => $customers->get(0)?->id,
                'created_by' => $manager->id,
            ],
            [
                'title' => 'Update office contact list',
                'description' => null,
                'status' => TaskStatus::SubmitForDesign,
                'priority' => TaskPriority::Low,
                'due_date' => now()->addWeek()->toDateString(),
                'assignee_id' => $staff->id,
                'customer_id' => null,
                'created_by' => $admin->id,
            ],
            [
                'title' => 'Follow up on invoice #1042',
                'description' => 'Customer reported they never received the invoice.',
                'status' => TaskStatus::SubmitForDesign,
                'priority' => TaskPriority::High,
                'due_date' => today()->subDay()->toDateString(),
                'assignee_id' => $manager->id,
                'customer_id' => $customers->get(1)?->id,
                'created_by' => $admin->id,
            ],
            [
                'title' => 'Review onboarding checklist',
                'description' => 'Walk through the new hire onboarding steps with the team.',
                'status' => TaskStatus::PrintComplete,
                'priority' => TaskPriority::Medium,
                'due_date' => now()->subDays(3)->toDateString(),
                'assignee_id' => $admin->id,
                'customer_id' => null,
                'created_by' => $admin->id,
            ],
            [
                'title' => 'Draft service agreement renewal',
                'description' => 'Prepare the renewal draft for Stark Industries.',
                'status' => TaskStatus::SubmitForDesign,
                'priority' => TaskPriority::Medium,
                'due_date' => now()->addDays(6)->toDateString(),
                'assignee_id' => $manager->id,
                'customer_id' => $customers->get(7)?->id,
                'created_by' => $admin->id,
            ],
            [
                'title' => 'Clean up shared drive',
                'description' => 'Archive files older than 12 months.',
                'status' => TaskStatus::Approved,
                'priority' => TaskPriority::Low,
                'due_date' => now()->addDays(10)->toDateString(),
                'assignee_id' => $staff->id,
                'customer_id' => null,
                'created_by' => $manager->id,
            ],
            [
                'title' => 'Fix login bug on portal',
                'description' => 'Users cannot reset passwords after the last deploy.',
                'status' => TaskStatus::SendForPrint,
                'priority' => TaskPriority::High,
                'due_date' => today()->toDateString(),
                'assignee_id' => $staff->id,
                'customer_id' => $customers->get(4)?->id,
                'created_by' => $manager->id,
            ],
            [
                'title' => 'Schedule team training session',
                'description' => null,
                'status' => TaskStatus::PrintComplete,
                'priority' => TaskPriority::Medium,
                'due_date' => now()->subDay()->toDateString(),
                'assignee_id' => $manager->id,
                'customer_id' => null,
                'created_by' => $admin->id,
            ],
        ];

        foreach ($tasks as $task) {
            Task::updateOrCreate(
                ['title' => $task['title']],
                $task,
            );
        }
    }
}
