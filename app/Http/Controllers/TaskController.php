<?php

namespace App\Http\Controllers;

use App\Enums\TaskStatus;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\TransitionTaskStatusRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Customer;
use App\Models\Task;
use App\Models\User;
use App\Services\TaskService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function index(TaskService $service): Response
    {
        $this->authorize('viewAny', Task::class);

        return Inertia::render('Tasks/Index', [
            'tasks' => TaskResource::collection(
                $service->listTasks(request()->only(['search', 'status', 'priority'])),
            )->response()->getData(true),
            'filters' => [
                'search' => request('search'),
                'status' => request('status'),
                'priority' => request('priority'),
            ],
            'users' => User::query()->select('id', 'name')->orderBy('name')->get(),
            'customers' => Customer::query()->select('id', 'name')->orderBy('name')->get(),
            'can' => [
                'create' => request()->user()->can('create', Task::class),
                'delete' => request()->user()->can('deleteAny', Task::class),
            ],
        ]);
    }

    public function store(StoreTaskRequest $request, TaskService $service): RedirectResponse
    {
        $this->authorize('create', Task::class);

        $service->createTask($request->validated(), $request->user());

        return back()->with('success', 'Task created.');
    }

    public function update(UpdateTaskRequest $request, TaskService $service, Task $task): RedirectResponse
    {
        $this->authorize('update', $task);

        $service->updateTask($task, $request->validated());

        return back()->with('success', sprintf('Task "%s" updated.', $task->title));
    }

    public function destroy(TaskService $service, Task $task): RedirectResponse
    {
        $this->authorize('delete', $task);

        $service->deleteTask($task);

        return back()->with('success', 'Task deleted.');
    }

    public function transitionStatus(
        TransitionTaskStatusRequest $request,
        TaskService $service,
        Task $task,
    ): RedirectResponse {
        $this->authorize('updateStatus', $task);

        try {
            $service->transitionStatus($task, TaskStatus::from($request->string('status')->toString()));
        } catch (\InvalidArgumentException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', sprintf('Task "%s" moved to %s.', $task->title, $task->status->label()));
    }
}
