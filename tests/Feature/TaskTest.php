<?php

namespace Tests\Feature;

use App\Enums\TaskStatus;
use App\Models\Customer;
use App\Models\Task;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Contracts\Broadcasting\Factory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
    }

    public function test_tasks_index_requires_authentication(): void
    {
        $this->get('/tasks')->assertRedirect('/login');
    }

    public function test_any_authenticated_user_can_view_tasks(): void
    {
        $staff = User::factory()->create();
        $staff->assignRole('staff');

        $assignee = User::factory()->create();
        $task = Task::factory()
            ->pending()
            ->assignedTo($assignee)
            ->create(['due_date' => now()->addWeek()->toDateString()]);

        $this->actingAs($staff)
            ->get('/tasks')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Tasks/Index')
                ->where('can.create', false)
                ->where('can.delete', false)
                ->where('tasks.data.0.id', $task->id)
                ->where('tasks.data.0.status', TaskStatus::Pending->value)
                ->where('tasks.data.0.assignee.name', $assignee->name)
                ->where('tasks.data.0.is_overdue', false)
                ->where('tasks.data.0.can_transition', false));
    }

    public function test_only_admins_and_managers_can_create_tasks(): void
    {
        $staff = User::factory()->create();
        $staff->assignRole('staff');

        $this->actingAs($staff)
            ->post('/tasks', [
                'title' => 'Nope',
                'status' => TaskStatus::Pending->value,
                'priority' => 'medium',
            ])
            ->assertForbidden();

        $this->assertDatabaseCount('tasks', 0);
    }

    public function test_manager_can_create_a_task(): void
    {
        $manager = User::factory()->create();
        $manager->assignRole('manager');

        $customer = Customer::factory()->create();

        $this->actingAs($manager)
            ->post('/tasks', [
                'title' => 'Prepare proposal',
                'description' => 'Draft the proposal for the client.',
                'status' => TaskStatus::Pending->value,
                'priority' => 'high',
                'due_date' => now()->addDays(3)->toDateString(),
                'assignee_id' => $manager->id,
                'customer_id' => $customer->id,
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('tasks', [
            'title' => 'Prepare proposal',
            'status' => TaskStatus::Pending->value,
            'priority' => 'high',
            'created_by' => $manager->id,
        ]);
    }

    public function test_task_creation_validation(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $this->actingAs($admin)
            ->from('/tasks')
            ->post('/tasks', [
                'title' => '',
                'status' => 'not-a-status',
                'priority' => 'urgent',
            ])
            ->assertSessionHasErrors(['title', 'status', 'priority']);
    }

    public function test_only_admins_and_managers_can_update_tasks(): void
    {
        $staff = User::factory()->create();
        $staff->assignRole('staff');

        $task = Task::factory()->create();

        $this->actingAs($staff)
            ->patch(route('tasks.update', $task), [
                'title' => 'Hacked',
                'status' => TaskStatus::Pending->value,
                'priority' => 'medium',
            ])
            ->assertForbidden();

        $this->assertNotSame('Hacked', $task->refresh()->title);
    }

    public function test_admin_can_update_a_task(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $task = Task::factory()->pending()->create();

        $this->actingAs($admin)
            ->patch(route('tasks.update', $task), [
                'title' => 'Updated Title',
                'status' => TaskStatus::InProgress->value,
                'priority' => 'low',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $task->refresh();

        $this->assertSame('Updated Title', $task->title);
        $this->assertSame(TaskStatus::InProgress, $task->status);
    }

    public function test_only_admins_can_delete_tasks(): void
    {
        $manager = User::factory()->create();
        $manager->assignRole('manager');

        $task = Task::factory()->create();

        $this->actingAs($manager)
            ->delete(route('tasks.destroy', $task))
            ->assertForbidden();

        $this->assertDatabaseHas('tasks', ['id' => $task->id]);
    }

    public function test_admin_can_delete_a_task(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $task = Task::factory()->pending()->create();

        $this->actingAs($admin)
            ->delete(route('tasks.destroy', $task))
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }

    public function test_assignee_can_start_their_own_task(): void
    {
        $staff = User::factory()->create();
        $staff->assignRole('staff');

        $task = Task::factory()->pending()->assignedTo($staff)->create();

        $this->actingAs($staff)
            ->patch(route('tasks.status.update', $task), [
                'status' => TaskStatus::InProgress->value,
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertSame(TaskStatus::InProgress, $task->refresh()->status);
    }

    public function test_assignee_can_complete_their_own_task(): void
    {
        $staff = User::factory()->create();
        $staff->assignRole('staff');

        $task = Task::factory()->inProgress()->assignedTo($staff)->create();

        $this->actingAs($staff)
            ->patch(route('tasks.status.update', $task), [
                'status' => TaskStatus::Completed->value,
            ])
            ->assertRedirect();

        $this->assertSame(TaskStatus::Completed, $task->refresh()->status);
    }

    public function test_non_assignee_staff_cannot_transition_a_task(): void
    {
        $otherStaff = User::factory()->create();
        $otherStaff->assignRole('staff');

        $owner = User::factory()->create();
        $task = Task::factory()->pending()->assignedTo($owner)->create();

        $this->actingAs($otherStaff)
            ->patch(route('tasks.status.update', $task), [
                'status' => TaskStatus::InProgress->value,
            ])
            ->assertForbidden();

        $this->assertSame(TaskStatus::Pending, $task->refresh()->status);
    }

    public function test_admin_can_transition_any_task(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $task = Task::factory()->pending()->create();

        $this->actingAs($admin)
            ->patch(route('tasks.status.update', $task), [
                'status' => TaskStatus::InProgress->value,
            ])
            ->assertRedirect();

        $this->assertSame(TaskStatus::InProgress, $task->refresh()->status);
    }

    public function test_status_transition_survives_a_broadcast_failure(): void
    {
        $this->mock(Factory::class, function ($mock) {
            $mock->shouldReceive('queue')
                ->andThrow(new \RuntimeException('Broadcaster unavailable'));
        });

        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $task = Task::factory()->pending()->create();

        $this->actingAs($admin)
            ->patch(route('tasks.status.update', $task), [
                'status' => TaskStatus::InProgress->value,
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertSame(TaskStatus::InProgress, $task->refresh()->status);
    }

    public function test_completed_tasks_cannot_be_updated(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $task = Task::factory()->completed()->create();

        $this->actingAs($admin)
            ->patch(route('tasks.update', $task), [
                'title' => 'Should not apply',
                'status' => TaskStatus::Completed->value,
                'priority' => 'medium',
            ])
            ->assertForbidden();

        $this->assertNotSame('Should not apply', $task->refresh()->title);
    }

    public function test_completed_tasks_cannot_be_deleted(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $task = Task::factory()->completed()->create();

        $this->actingAs($admin)
            ->delete(route('tasks.destroy', $task))
            ->assertForbidden();

        $this->assertDatabaseHas('tasks', ['id' => $task->id]);
    }

    public function test_forward_only_transitions_are_enforced(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $task = Task::factory()->pending()->create();

        $this->actingAs($admin)
            ->from('/tasks')
            ->patch(route('tasks.status.update', $task), [
                'status' => TaskStatus::Completed->value,
            ])
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertSame(TaskStatus::Pending, $task->refresh()->status);
    }

    public function test_tasks_can_be_filtered_by_status(): void
    {
        $staff = User::factory()->create();
        $staff->assignRole('staff');

        Task::factory()->pending()->create();
        Task::factory()->completed()->create();

        $this->actingAs($staff)
            ->get('/tasks?status=completed')
            ->assertOk();
    }
}
