<?php

namespace App\Notifications;

use App\Enums\TaskStatus;
use App\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TaskStatusUpdatedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Task $task,
        public string $oldStatus,
        public string $newStatus,
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * The data to store for the database channel.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'task_id' => $this->task->id,
            'title' => $this->task->title,
            'old_status' => $this->oldStatus,
            'new_status' => $this->newStatus,
            'message' => sprintf(
                'Task "%s" moved from %s to %s.',
                $this->task->title,
                TaskStatus::from($this->oldStatus)->label(),
                TaskStatus::from($this->newStatus)->label(),
            ),
        ];
    }

    /**
     * The data to broadcast to the notifiable's private channel.
     *
     * @return array<string, mixed>
     */
    public function toBroadcast(object $notifiable): array
    {
        return $this->toArray($notifiable);
    }

    /**
     * The event name the notification should broadcast as.
     */
    public function broadcastType(): string
    {
        return 'task.status_updated';
    }
}
