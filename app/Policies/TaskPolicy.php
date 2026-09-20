<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    /**
     * Determine whether the user can view any tasks.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the task.
     */
    public function view(User $user, Task $task): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create tasks.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isManager();
    }

    /**
     * Determine whether the user can update the task.
     */
    public function update(User $user, Task $task): bool
    {
        return ($user->isAdmin() || $user->isManager()) && ! $task->isTerminal();
    }

    /**
     * Determine whether the user can delete any tasks.
     */
    public function deleteAny(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can delete the task.
     */
    public function delete(User $user, Task $task): bool
    {
        return $user->isAdmin() && ! $task->isTerminal();
    }

    /**
     * Determine whether the user can transition the task's status.
     */
    public function updateStatus(User $user, Task $task): bool
    {
        return ! $task->isTerminal()
            && ($user->isAdmin() || $user->isManager() || $task->assignee_id === $user->id);
    }
}
