<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Task Report</title>
    <style>
        body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 11px; color: #111827; }
        h1 { font-size: 18px; margin: 0 0 2px; }
        .meta { color: #6b7280; font-size: 10px; margin-bottom: 14px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #d1d5db; padding: 5px 7px; text-align: left; vertical-align: top; }
        th { background: #f3f4f6; font-weight: bold; }
    </style>
</head>
<body>
    <h1>Task Report</h1>
    <p class="meta">
        Generated {{ now()->format('Y-m-d H:i') }}
        @if (request('search')) &middot; Search: "{{ request('search') }}" @endif
        @if (request('status')) &middot; Status: {{ \App\Enums\TaskStatus::tryFrom(request('status'))?->label() ?? request('status') }} @endif
        @if (request('priority')) &middot; Priority: {{ \App\Enums\TaskPriority::tryFrom(request('priority'))?->label() ?? request('priority') }} @endif
    </p>
    <table>
        <thead>
            <tr>
                <th>SL</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Description</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Assigned By</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($tasks as $task)
                <tr>
                    <td>{{ $loop->iteration }}</td>
                    <td>{{ format_datetime($task->created_at) }}</td>
                    <td>{{ $task->customer?->name ?? '-' }}</td>
                    <td>{{ $task->description ?? '' }}</td>
                    <td>{{ $task->status->label() }}</td>
                    <td>{{ $task->assignee?->name ?? 'Unassigned' }}</td>
                    <td>{{ $task->creator?->name ?? '-' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="7">No tasks match the current filters.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
