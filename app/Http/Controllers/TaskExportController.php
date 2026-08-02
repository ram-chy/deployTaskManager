<?php

namespace App\Http\Controllers;

use App\Exports\TasksExport;
use App\Models\Task;
use App\Services\TaskService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class TaskExportController extends Controller
{
    public function excel(Request $request, TaskService $service)
    {
        $this->authorize('viewAny', Task::class);

        $filters = $request->only(['search', 'status', 'priority', 'from', 'to']);

        return Excel::download(
            new TasksExport($service, $filters),
            'tasks-'.now()->format('Y-m-d').'.xlsx',
        );
    }

    public function pdf(Request $request, TaskService $service)
    {
        $this->authorize('viewAny', Task::class);

        $filters = $request->only(['search', 'status', 'priority', 'from', 'to']);
        $tasks = $service->queryTasks($filters)->latest()->get();

        return Pdf::loadView('exports.tasks', ['tasks' => $tasks])
            ->download('tasks-'.now()->format('Y-m-d').'.pdf');
    }
}
