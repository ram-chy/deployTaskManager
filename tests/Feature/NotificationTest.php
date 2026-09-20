<?php

namespace Tests\Feature;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Events\TaskCreated;
use App\Events\TaskStatusUpdated;
use App\Models\Task;
use App\Models\User;
use App\Notifications\TaskAssignedNotification;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
    }

    public function test_task_creation_broadcasts_task_created_event(): void
    {
        $manager = User::factory()->create();
        $manager->assignRole('manager');

        Event::fake([TaskCreated::class]);

        $this->actingAs($manager)->post('/tasks', [
            'title' => 'Broadcast me',
            'status' => TaskStatus::Pending->value,
            'priority' => TaskPriority::Medium->value,
        ]);

        Event::assertDispatched(
            TaskCreated::class,
            fn (TaskCreated $event): bool => $event->broadcastOn()[0]->name === 'private-tasks'
                && $event->broadcastWith()['title'] === 'Broadcast me',
        );
    }

    public function test_status_transition_broadcasts_task_status_updated_event(): void
    {
        $manager = User::factory()->create();
        $manager->assignRole('manager');

        $task = Task::factory()->pending()->create();

        Event::fake([TaskStatusUpdated::class]);

        $this->actingAs($manager)
            ->patch(route('tasks.status.update', $task), [
                'status' => TaskStatus::InProgress->value,
            ]);

        Event::assertDispatched(
            TaskStatusUpdated::class,
            fn (TaskStatusUpdated $event): bool => $event->task->is($task)
                && $event->oldStatus === TaskStatus::Pending->value
                && $event->newStatus === TaskStatus::InProgress->value,
        );
    }

    public function test_creating_task_with_assignee_stores_database_notification(): void
    {
        $manager = User::factory()->create();
        $manager->assignRole('manager');

        $assignee = User::factory()->create();

        $this->actingAs($manager)->post('/tasks', [
            'title' => 'For you',
            'status' => TaskStatus::Pending->value,
            'priority' => TaskPriority::High->value,
            'assignee_id' => $assignee->id,
        ]);

        $this->assertDatabaseCount('notifications', 1);
        $this->assertSame(1, $assignee->unreadNotifications()->count());
        $this->assertStringContainsString('For you', $assignee->notifications->first()->data['message']);
    }

    public function test_creating_task_without_assignee_does_not_notify(): void
    {
        $manager = User::factory()->create();
        $manager->assignRole('manager');

        $this->actingAs($manager)->post('/tasks', [
            'title' => 'Unassigned',
            'status' => TaskStatus::Pending->value,
            'priority' => TaskPriority::Low->value,
        ]);

        $this->assertDatabaseCount('notifications', 0);
    }

    public function test_changing_assignee_notifies_the_new_assignee(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $oldAssignee = User::factory()->create();
        $newAssignee = User::factory()->create();

        $task = Task::factory()->pending()->assignedTo($oldAssignee)->create();

        $this->actingAs($admin)
            ->patch(route('tasks.update', $task), [
                'title' => $task->title,
                'status' => TaskStatus::Pending->value,
                'priority' => TaskPriority::Medium->value,
                'assignee_id' => $newAssignee->id,
            ]);

        $this->assertSame(0, $oldAssignee->unreadNotifications()->count());
        $this->assertSame(1, $newAssignee->unreadNotifications()->count());
    }

    public function test_status_transition_notifies_the_assignee(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $assignee = User::factory()->create();
        $task = Task::factory()->pending()->assignedTo($assignee)->create();

        $this->actingAs($admin)
            ->patch(route('tasks.status.update', $task), [
                'status' => TaskStatus::InProgress->value,
            ]);

        $this->assertSame(1, $assignee->unreadNotifications()->count());
        $this->assertStringContainsString('In Progress', $assignee->notifications->first()->data['message']);
    }

    public function test_notifications_index_requires_authentication(): void
    {
        $this->get('/notifications')->assertRedirect('/login');
    }

    public function test_notifications_index_returns_list_and_unread_count(): void
    {
        $user = User::factory()->create();

        $task = Task::factory()->pending()->assignedTo($user)->create();
        $user->notify(new TaskAssignedNotification($task));

        $this->actingAs($user)
            ->getJson('/notifications')
            ->assertOk()
            ->assertJsonPath('unread_count', 1)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.message', sprintf('You have been assigned task "%s".', $task->title));
    }

    public function test_mark_all_read(): void
    {
        $user = User::factory()->create();

        $task = Task::factory()->pending()->assignedTo($user)->create();
        $user->notify(new TaskAssignedNotification($task));

        $this->actingAs($user)
            ->postJson('/notifications/read')
            ->assertOk()
            ->assertJsonPath('unread_count', 0);

        $this->assertSame(0, $user->unreadNotifications()->count());
    }

    public function test_any_authenticated_user_can_authorize_on_tasks_channel(): void
    {
        $this->usePusherBroadcaster();

        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/broadcasting/auth', [
                'channel_name' => 'private-tasks',
                'socket_id' => '123.456',
            ])
            ->assertOk();
    }

    public function test_only_channel_owner_can_authorize_on_private_user_channel(): void
    {
        $this->usePusherBroadcaster();

        $owner = User::factory()->create();
        $other = User::factory()->create();

        $this->actingAs($owner)
            ->postJson('/broadcasting/auth', [
                'channel_name' => "private-App.Models.User.{$owner->id}",
                'socket_id' => '123.456',
            ])
            ->assertOk();

        $this->actingAs($other)
            ->postJson('/broadcasting/auth', [
                'channel_name' => "private-App.Models.User.{$owner->id}",
                'socket_id' => '123.456',
            ])
            ->assertForbidden();
    }

    /**
     * Use the pusher broadcaster so channel authorization closures are enforced.
     */
    private function usePusherBroadcaster(): void
    {
        config()->set('broadcasting.default', 'pusher');
        config()->set('broadcasting.connections.pusher', [
            'driver' => 'pusher',
            'key' => 'test-key',
            'secret' => 'test-secret',
            'app_id' => 'test-app',
            'options' => [
                'host' => '127.0.0.1',
                'port' => 9999,
                'scheme' => 'http',
                'useTLS' => false,
            ],
        ]);

        require base_path('routes/channels.php');
    }
}
