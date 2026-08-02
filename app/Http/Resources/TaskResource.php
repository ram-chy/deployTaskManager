<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status->value,
            'priority' => $this->priority->value,
            'due_date' => $this->due_date?->format('Y-m-d'),
            'is_overdue' => $this->isOverdue(),
            'assignee_id' => $this->assignee_id,
            'assignee' => $this->whenLoaded('assignee', fn () => $this->assignee
                ? ['id' => $this->assignee->id, 'name' => $this->assignee->name]
                : null),
            'customer_id' => $this->customer_id,
            'customer' => $this->whenLoaded('customer', fn () => $this->customer
                ? ['id' => $this->customer->id, 'name' => $this->customer->name]
                : null),
            'creator' => $this->whenLoaded('creator', fn () => $this->creator
                ? ['id' => $this->creator->id, 'name' => $this->creator->name]
                : null),
            'created_at' => format_datetime($this->created_at),
            'updated_at' => format_datetime($this->updated_at),
            'can_transition' => $request->user()?->can('updateStatus', $this->resource) ?? false,
            'can_edit' => $request->user()?->can('update', $this->resource) ?? false,
            'can_delete' => $request->user()?->can('delete', $this->resource) ?? false,
        ];
    }
}
