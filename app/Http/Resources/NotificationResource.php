<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = $this->data ?? [];

        return [
            'id' => $this->id,
            'task_id' => $data['task_id'] ?? null,
            'title' => $data['title'] ?? null,
            'message' => $data['message'] ?? 'New notification',
            'read_at' => $this->read_at?->toIso8601String(),
            'created_at' => format_datetime($this->created_at),
        ];
    }
}
