<?php

namespace App\Enums;

enum TaskStatus: string
{
    case Pending = 'pending';
    case InProgress = 'in_progress';
    case Completed = 'completed';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::InProgress => 'In Progress',
            self::Completed => 'Completed',
        };
    }

    /**
     * The next status in the workflow, or null when the task is done.
     */
    public function next(): ?self
    {
        return match ($this) {
            self::Pending => self::InProgress,
            self::InProgress => self::Completed,
            self::Completed => null,
        };
    }
}
