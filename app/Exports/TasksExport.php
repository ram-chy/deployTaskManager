<?php

namespace App\Exports;

use App\Services\TaskService;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class TasksExport implements FromQuery, ShouldAutoSize, WithHeadings, WithMapping, WithStyles
{
    public function __construct(
        private readonly TaskService $service,
        private readonly array $filters = [],
    ) {}

    private int $serial = 0;

    public function query(): Builder
    {
        return $this->service->queryTasks($this->filters)->latest();
    }

    public function headings(): array
    {
        return ['SL', 'Date', 'Customer', 'Description', 'Status', 'Assigned To', 'Assigned By'];
    }

    public function map($task): array
    {
        return [
            ++$this->serial,
            format_datetime($task->created_at),
            $task->customer?->name ?? '-',
            $task->description ?? '',
            $task->status?->label() ?? $task->status,
            $task->assignee?->name ?? 'Unassigned',
            $task->creator?->name ?? '-',
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
