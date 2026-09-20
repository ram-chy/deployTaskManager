<?php

namespace Tests\Feature;

use App\Enums\TaskStatus;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_requires_authentication(): void
    {
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_dashboard_renders_with_empty_stats(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('stats.pending', 0)
                ->where('stats.in_progress', 0)
                ->where('stats.under_review', 0)
                ->where('stats.completed', 0)
                ->where('stats.cancelled', 0)
                ->where('stats.today', 0)
                ->where('recentActivities', []));
    }

    public function test_dashboard_stats_reflect_task_counts(): void
    {
        $user = User::factory()->create();

        Task::factory()->pending()->create(['due_date' => null]);
        Task::factory()->pending()->create(['due_date' => null]);
        Task::factory()->inProgress()->create(['due_date' => null]);
        Task::factory()->completed()->create(['due_date' => null]);

        Task::factory()->create([
            'status' => TaskStatus::Pending,
            'due_date' => today(),
        ]);

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertInertia(fn (Assert $page) => $page
                ->where('stats.pending', 3)
                ->where('stats.in_progress', 1)
                ->where('stats.under_review', 0)
                ->where('stats.completed', 1)
                ->where('stats.cancelled', 0)
                ->where('stats.today', 1));
    }

    public function test_terminated_tasks_due_today_are_not_counted_as_today(): void
    {
        $user = User::factory()->create();

        Task::factory()->create([
            'status' => TaskStatus::Completed,
            'due_date' => today(),
        ]);
        Task::factory()->create([
            'status' => TaskStatus::Cancelled,
            'due_date' => today(),
        ]);

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertInertia(fn (Assert $page) => $page->where('stats.today', 0));
    }

    public function test_dashboard_lists_recent_activities_most_recent_first(): void
    {
        $user = User::factory()->create();
        $assignee = User::factory()->create();

        $first = Task::factory()->pending()->assignedTo($assignee)->create();
        $first->forceFill(['updated_at' => now()->subMinutes(5)])->save();

        $latest = Task::factory()->inProgress()->assignedTo($assignee)->create();

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertInertia(fn (Assert $page) => $page
                ->where('recentActivities.0.id', $latest->id)
                ->where('recentActivities.0.status', TaskStatus::InProgress->value)
                ->where('recentActivities.0.title', $latest->title)
                ->where('recentActivities.0.assignee.name', $assignee->name)
                ->where('recentActivities.1.id', $first->id)
                ->has('recentActivities', 2));
    }
}
