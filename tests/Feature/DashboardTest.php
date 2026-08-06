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
                ->where('stats.submit_for_design', 0)
                ->where('stats.send_for_approve', 0)
                ->where('stats.approved', 0)
                ->where('stats.send_for_print', 0)
                ->where('stats.print_complete', 0)
                ->where('stats.today', 0)
                ->where('recentActivities', []));
    }

    public function test_dashboard_stats_reflect_task_counts(): void
    {
        $user = User::factory()->create();

        Task::factory()->submittedForDesign()->create(['due_date' => null]);
        Task::factory()->submittedForDesign()->create(['due_date' => null]);
        Task::factory()->sendForApprove()->create(['due_date' => null]);
        Task::factory()->printCompleted()->create(['due_date' => null]);

        Task::factory()->create([
            'status' => TaskStatus::SubmitForDesign,
            'due_date' => today(),
        ]);

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertInertia(fn (Assert $page) => $page
                ->where('stats.submit_for_design', 3)
                ->where('stats.send_for_approve', 1)
                ->where('stats.approved', 0)
                ->where('stats.send_for_print', 0)
                ->where('stats.print_complete', 1)
                ->where('stats.today', 1));
    }

    public function test_print_complete_tasks_due_today_are_not_counted_as_today(): void
    {
        $user = User::factory()->create();

        Task::factory()->create([
            'status' => TaskStatus::PrintComplete,
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

        $first = Task::factory()->submittedForDesign()->assignedTo($assignee)->create();
        $first->forceFill(['updated_at' => now()->subMinutes(5)])->save();

        $latest = Task::factory()->sendForApprove()->assignedTo($assignee)->create();

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertInertia(fn (Assert $page) => $page
                ->where('recentActivities.0.id', $latest->id)
                ->where('recentActivities.0.status', TaskStatus::SendForApprove->value)
                ->where('recentActivities.0.title', $latest->title)
                ->where('recentActivities.0.assignee.name', $assignee->name)
                ->where('recentActivities.1.id', $first->id)
                ->has('recentActivities', 2));
    }
}
