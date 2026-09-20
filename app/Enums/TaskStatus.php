<?php

namespace App\Enums;

enum TaskStatus: string
{
    case Pending = 'pending';
    case InProgress = 'in_progress';
    case UnderReview = 'under_review';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::InProgress => 'In Progress',
            self::UnderReview => 'Under Review',
            self::Completed => 'Completed',
            self::Cancelled => 'Cancelled',
        };
    }

    /**
     * The next status in the workflow, or null when the task is finished.
     */
    public function next(): ?self
    {
        return match ($this) {
            self::Pending => self::InProgress,
            self::InProgress => self::UnderReview,
            self::UnderReview => self::Completed,
            self::Completed => null,
            self::Cancelled => null,
        };
    }

    /**
     * Whether a status is a terminal state (no further transitions allowed).
     */
    public function isTerminal(): bool
    {
        return $this === self::Completed || $this === self::Cancelled;
    }

    /**
     * Whether the task can be moved directly to the given status.
     */
    public function canTransitionTo(TaskStatus $status): bool
    {
        if ($status === self::Cancelled) {
            return ! $this->isTerminal();
        }

        return $status === $this->next();
    }
}
