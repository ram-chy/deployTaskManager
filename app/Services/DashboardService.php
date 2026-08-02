<?php

namespace App\Services;

use App\Enums\TaskStatus;
use App\Models\Task;
use Illuminate\Database\Eloquent\Collection;

class DashboardService extends AbstractService
{
    /**
     * Count tasks grouped by status.
     *
     * @return array<string, int>
     */
    public function getStatusCounts(): array
    {
        return Task::query()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->map(fn (int|string $count): int => (int) $count)
            ->all();
    }

    /**
     * Number of open tasks due today.
     */
    public function getTodaysTaskCount(): int
    {
        return Task::query()
            ->whereDate('due_date', today())
            ->where('status', '!=', TaskStatus::Completed)
            ->count();
    }

    /**
     * The most recently updated tasks for the activity feed.
     */
    public function getRecentActivities(int $limit = 5): Collection
    {
        return Task::query()
            ->with(['assignee:id,name'])
            ->latest('updated_at')
            ->limit($limit)
            ->get();
    }
}
