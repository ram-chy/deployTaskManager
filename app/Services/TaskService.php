<?php

namespace App\Services;

use App\Enums\TaskStatus;
use App\Events\TaskCreated;
use App\Events\TaskStatusUpdated;
use App\Models\Task;
use App\Models\User;
use App\Notifications\TaskAssignedNotification;
use App\Notifications\TaskStatusUpdatedNotification;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

class TaskService extends AbstractService
{
    /**
     * Paginate tasks, optionally filtered by search/status/priority.
     */
    public function listTasks(array $filters = []): LengthAwarePaginator
    {
        return $this->queryTasks($filters)
            ->latest()
            ->paginate(10)
            ->withQueryString();
    }

    /**
     * Build a filtered task query (shared by the index list and exports).
     */
    public function queryTasks(array $filters = []): Builder
    {
        return Task::query()
            ->with([
                'assignee:id,name',
                'customer',
                'creator:id,name',
            ])
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where('title', 'like', "%{$search}%");
            })
            ->when($filters['status'] ?? null, function ($query, string $status) {
                $query->where('status', $status);
            })
            ->when($filters['priority'] ?? null, function ($query, string $priority) {
                $query->where('priority', $priority);
            })
            ->when($filters['from'] ?? null, function ($query, string $from) {
                $query->whereDate('created_at', '>=', $from);
            })
            ->when($filters['to'] ?? null, function ($query, string $to) {
                $query->whereDate('created_at', '<=', $to);
            });
    }

    public function createTask(array $data, User $creator): Task
    {
        $task = Task::create([...$data, 'created_by' => $creator->id]);

        $this->broadcast(fn () => TaskCreated::dispatch($task));

        if ($task->assignee_id) {
            $task->assignee?->notify(new TaskAssignedNotification($task));
        }

        return $task;
    }

    public function updateTask(Task $task, array $data): Task
    {
        $previousAssigneeId = $task->assignee_id;

        $task->update($data);

        $task = $task->refresh();

        if ($task->assignee_id && $task->assignee_id !== $previousAssigneeId) {
            $task->assignee?->notify(new TaskAssignedNotification($task));
        }

        return $task;
    }

    public function deleteTask(Task $task): void
    {
        $task->delete();
    }

    /**
     * Move a task forward in the workflow or cancel it
     * (pending → in_progress → under_review → completed, or cancel at any point).
     */
    public function transitionStatus(Task $task, TaskStatus $status): Task
    {
        if ($status === $task->status) {
            return $task;
        }

        if (! $task->status->canTransitionTo($status)) {
            throw new \InvalidArgumentException(sprintf(
                'Cannot move task from "%s" to "%s".',
                $task->status->label(),
                $status->label(),
            ));
        }

        $previousStatus = $task->status->value;

        $task->update(['status' => $status]);

        $task = $task->refresh();

        $this->broadcast(fn () => TaskStatusUpdated::dispatch(
            $task,
            $previousStatus,
            $task->status->value,
        ));

        if ($task->assignee_id) {
            $task->assignee?->notify(new TaskStatusUpdatedNotification(
                $task,
                $previousStatus,
                $task->status->value,
            ));
        }

        return $task;
    }

    /**
     * Dispatch a broadcast without letting a failing broadcaster abort the request.
     */
    private function broadcast(\Closure $callback): void
    {
        try {
            $callback();
        } catch (\Throwable $exception) {
            report($exception);
        }
    }
}
