import AppLayout from '@/layouts/AppLayout';
import Badge, { type BadgeVariant } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Table, { type TableColumn } from '@/components/ui/Table';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/utils/cn';
import type {
    Task,
    TaskPriority,
    TaskReference,
    TaskStatus,
} from '@/types';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface TasksProps {
    tasks: {
        data: Task[];
        meta: {
            current_page: number;
            last_page: number;
            total: number;
            links: PaginationLink[];
        };
    };
    filters: {
        search: string | null;
        status: TaskStatus | null;
        priority: TaskPriority | null;
    };
    users: TaskReference[];
    customers: TaskReference[];
    can: {
        create: boolean;
        delete: boolean;
    };
}

interface TaskFormValues {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_date: string;
    assignee_id: number | '';
    customer_id: number | '';
}

const emptyForm: TaskFormValues = {
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    due_date: '',
    assignee_id: '',
    customer_id: '',
};

const statusOptions: Array<{ value: TaskStatus; label: string }> = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
];

const priorityOptions: Array<{ value: TaskPriority; label: string }> = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
];

const statusVariant: Record<TaskStatus, BadgeVariant> = {
    pending: 'warning',
    in_progress: 'info',
    completed: 'success',
};

const priorityVariant: Record<TaskPriority, BadgeVariant> = {
    low: 'neutral',
    medium: 'warning',
    high: 'danger',
};

const cleanLabel = (label: string): string =>
    label.replace('&laquo;', '\u00ab').replace('&raquo;', '\u00bb').trim();

const selectClasses =
    'block w-full rounded-md border-0 bg-white px-2.5 py-2 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600';

interface TaskFormModalProps {
    open: boolean;
    onClose: () => void;
    task: Task | null;
    users: TaskReference[];
    customers: TaskReference[];
}

function TaskFormModal({
    open,
    onClose,
    task,
    users,
    customers,
}: TaskFormModalProps) {
    const isEditing = task !== null;

    const { data, setData, errors, processing, post, patch, reset } =
        useForm<TaskFormValues>(
            task
                ? {
                      title: task.title,
                      description: task.description ?? '',
                      status: task.status,
                      priority: task.priority,
                      due_date: task.due_date ?? '',
                      assignee_id: task.assignee_id ?? '',
                      customer_id: task.customer_id ?? '',
                  }
                : emptyForm,
        );

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        if (isEditing && task) {
            patch(route('tasks.update', task.id), {
                preserveScroll: true,
                onSuccess: () => handleClose(),
            });
        } else {
            post(route('tasks.store'), {
                preserveScroll: true,
                onSuccess: () => handleClose(),
            });
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title={isEditing ? 'Edit Task' : 'New Task'}
            description={
                isEditing
                    ? 'Update the task details below.'
                    : 'Create a new task for the team.'
            }
            size="xl"
            footer={
                <>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="task-form"
                        loading={processing}
                    >
                        {isEditing ? 'Save Changes' : 'Create Task'}
                    </Button>
                </>
            }
        >
            <form id="task-form" onSubmit={submit} className="space-y-4">
                <Input
                    label="Title"
                    value={data.title}
                    onChange={(event) => setData('title', event.target.value)}
                    error={errors.title}
                    required
                    autoFocus
                />

                <div className="space-y-1.5">
                    <label
                        htmlFor="task-description"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Description
                    </label>
                    <textarea
                        id="task-description"
                        rows={3}
                        value={data.description}
                        onChange={(event) =>
                            setData('description', event.target.value)
                        }
                        className="block w-full rounded-md border-0 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600"
                    />
                    {errors.description && (
                        <p className="text-xs text-red-600">
                            {errors.description}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5">
                        <label
                            htmlFor="task-status"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Status
                        </label>
                        <select
                            id="task-status"
                            value={data.status}
                            onChange={(event) =>
                                setData(
                                    'status',
                                    event.target.value as TaskStatus,
                                )
                            }
                            className={selectClasses}
                        >
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="task-priority"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Priority
                        </label>
                        <select
                            id="task-priority"
                            value={data.priority}
                            onChange={(event) =>
                                setData(
                                    'priority',
                                    event.target.value as TaskPriority,
                                )
                            }
                            className={selectClasses}
                        >
                            {priorityOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="task-due-date"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Due Date
                        </label>
                        <input
                            id="task-due-date"
                            type="date"
                            value={data.due_date}
                            onChange={(event) =>
                                setData('due_date', event.target.value)
                            }
                            className={selectClasses}
                        />
                        {errors.due_date && (
                            <p className="text-xs text-red-600">
                                {errors.due_date}
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <label
                            htmlFor="task-assignee"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Assignee
                        </label>
                        <select
                            id="task-assignee"
                            value={data.assignee_id}
                            onChange={(event) =>
                                setData(
                                    'assignee_id',
                                    event.target.value === ''
                                        ? ''
                                        : Number(event.target.value),
                                )
                            }
                            className={selectClasses}
                        >
                            <option value="">Unassigned</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name}
                                </option>
                            ))}
                        </select>
                        {errors.assignee_id && (
                            <p className="text-xs text-red-600">
                                {errors.assignee_id}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="task-customer"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Customer
                        </label>
                        <select
                            id="task-customer"
                            value={data.customer_id}
                            onChange={(event) =>
                                setData(
                                    'customer_id',
                                    event.target.value === ''
                                        ? ''
                                        : Number(event.target.value),
                                )
                            }
                            className={selectClasses}
                        >
                            <option value="">No customer</option>
                            {customers.map((customer) => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.name}
                                </option>
                            ))}
                        </select>
                        {errors.customer_id && (
                            <p className="text-xs text-red-600">
                                {errors.customer_id}
                            </p>
                        )}
                    </div>
                </div>
            </form>
        </Modal>
    );
}

interface DeleteTaskModalProps {
    task: Task | null;
    onClose: () => void;
}

function DeleteTaskModal({ task, onClose }: DeleteTaskModalProps) {
    const [processing, setProcessing] = useState(false);

    const confirmDelete = () => {
        if (!task) {
            return;
        }

        setProcessing(true);

        router.delete(route('tasks.destroy', task.id), {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
            onSuccess: () => onClose(),
        });
    };

    return (
        <Modal
            open={task !== null}
            onClose={onClose}
            title="Delete Task"
            description={
                task
                    ? `Are you sure you want to delete "${task.title}"? This action cannot be undone.`
                    : undefined
            }
            size="sm"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={confirmDelete}
                        loading={processing}
                    >
                        Delete
                    </Button>
                </>
            }
        />
    );
}

export default function TasksIndex({
    tasks,
    filters,
    users,
    customers,
    can,
}: TasksProps) {
    const [searchInput, setSearchInput] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>(
        filters.status ?? '',
    );
    const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>(
        filters.priority ?? '',
    );
    const [formOpen, setFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [deletingTask, setDeletingTask] = useState<Task | null>(null);
    const [transitioningId, setTransitioningId] = useState<number | null>(null);
    const [exportFrom, setExportFrom] = useState('');
    const [exportTo, setExportTo] = useState('');
    const filterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;

            return;
        }

        if (filterTimer.current) {
            clearTimeout(filterTimer.current);
        }

        filterTimer.current = setTimeout(() => {
            router.get(
                route('tasks.index'),
                {
                    search: searchInput || undefined,
                    status: statusFilter || undefined,
                    priority: priorityFilter || undefined,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 300);

        return () => {
            if (filterTimer.current) {
                clearTimeout(filterTimer.current);
            }
        };
    }, [searchInput, statusFilter, priorityFilter]);

    const openCreate = () => {
        setEditingTask(null);
        setFormOpen(true);
    };

    const openEdit = (task: Task) => {
        setEditingTask(task);
        setFormOpen(true);
    };

    const transition = (task: Task, status: TaskStatus) => {
        if (transitioningId === task.id) {
            return;
        }

        setTransitioningId(task.id);

        router.patch(
            route('tasks.status.update', task.id),
            { status },
            {
                preserveScroll: true,
                onFinish: () => setTransitioningId(null),
            },
        );
    };

    const columns = useMemo<Array<TableColumn<Task>>>(
        () => [
            {
                key: 'title',
                header: 'Task',
                cell: (task) => (
                    <div className="max-w-xs">
                        <div className="font-medium text-gray-900">
                            {task.title}
                        </div>
                        {task.description && (
                            <div className="mt-0.5 line-clamp-1 text-xs text-gray-500">
                                {task.description}
                            </div>
                        )}
                    </div>
                ),
            },
            {
                key: 'priority',
                header: 'Priority',
                cell: (task) => (
                    <Badge variant={priorityVariant[task.priority]}>
                        {task.priority.charAt(0).toUpperCase() +
                            task.priority.slice(1)}
                    </Badge>
                ),
            },
            {
                key: 'status',
                header: 'Status',
                cell: (task) => (
                    <Badge variant={statusVariant[task.status]}>
                        {task.status === 'in_progress'
                            ? 'In Progress'
                            : task.status.charAt(0).toUpperCase() +
                              task.status.slice(1)}
                    </Badge>
                ),
            },
            {
                key: 'assignee',
                header: 'Assigned To',
                cell: (task) => (
                    <span className="text-gray-600">
                        {task.assignee?.name ?? (
                            <span className="text-gray-400">&mdash;</span>
                        )}
                    </span>
                ),
            },
            {
                key: 'creator',
                header: 'Assigned By',
                cell: (task) => (
                    <span className="text-gray-600">
                        {task.creator?.name ?? (
                            <span className="text-gray-400">&mdash;</span>
                        )}
                    </span>
                ),
            },
            {
                key: 'customer',
                header: 'Customer',
                cell: (task) => (
                    <span className="text-gray-600">
                        {task.customer?.name ?? (
                            <span className="text-gray-400">&mdash;</span>
                        )}
                    </span>
                ),
            },
            {
                key: 'due_date',
                header: 'Due',
                cell: (task) => (
                    <div className="flex items-center gap-1.5">
                        <span
                            className={cn(
                                'text-gray-600',
                                task.is_overdue && 'font-medium text-red-600',
                            )}
                        >
                            {task.due_date ?? (
                                <span className="text-gray-400">&mdash;</span>
                            )}
                        </span>
                        {task.is_overdue && (
                            <Badge variant="danger">Overdue</Badge>
                        )}
                    </div>
                ),
            },
            {
                key: 'actions',
                header: 'Actions',
                className: 'text-right',
                headerClassName: 'text-right',
                cell: (task) => (
                    <div className="flex items-center justify-end gap-1.5">
                        {task.status === 'pending' && task.can_transition && (
                            <Button
                                size="sm"
                                variant="outline"
                                loading={transitioningId === task.id}
                                onClick={() => transition(task, 'in_progress')}
                            >
                                Start
                            </Button>
                        )}
                        {task.status === 'in_progress' &&
                            task.can_transition && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    loading={transitioningId === task.id}
                                    onClick={() => transition(task, 'completed')}
                                >
                                    Complete
                                </Button>
                            )}
                        {task.can_edit && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEdit(task)}
                            >
                                Edit
                            </Button>
                        )}
                        {task.can_delete && (
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() => setDeletingTask(task)}
                            >
                                Delete
                            </Button>
                        )}
                    </div>
                ),
            },
        ],
        [can.create, can.delete, transitioningId],
    );

    const start =
        tasks.meta.total === 0
            ? 0
            : (tasks.meta.current_page - 1) * tasks.data.length + 1;
    const end = Math.min(
        tasks.meta.current_page * tasks.data.length,
        tasks.meta.total,
    );

    const exportParams = useMemo(() => {
        const params: Record<string, string> = {};

        if (searchInput) {
            params.search = searchInput;
        }
        if (statusFilter) {
            params.status = statusFilter;
        }
        if (priorityFilter) {
            params.priority = priorityFilter;
        }
        if (exportFrom) {
            params.from = exportFrom;
        }
        if (exportTo) {
            params.to = exportTo;
        }

        return params;
    }, [searchInput, statusFilter, priorityFilter, exportFrom, exportTo]);

    const exportLinkClasses =
        'inline-flex items-center justify-center rounded-md border border-primary-600 px-3.5 py-2 text-sm font-semibold text-primary-600 transition hover:bg-primary-50';

    return (
        <AppLayout title="Tasks">
            <Head title="Tasks" />

            <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900">
                            Tasks
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Track and manage the team's work.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5">
                            <label
                                htmlFor="export-from"
                                className="text-xs font-medium text-gray-600"
                            >
                                From
                            </label>
                            <input
                                id="export-from"
                                type="date"
                                value={exportFrom}
                                onChange={(event) =>
                                    setExportFrom(event.target.value)
                                }
                                className="rounded-md border-0 bg-white px-2 py-1.5 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600"
                            />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <label
                                htmlFor="export-to"
                                className="text-xs font-medium text-gray-600"
                            >
                                To
                            </label>
                            <input
                                id="export-to"
                                type="date"
                                value={exportTo}
                                onChange={(event) =>
                                    setExportTo(event.target.value)
                                }
                                className="rounded-md border-0 bg-white px-2 py-1.5 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600"
                            />
                        </div>
                        <a
                            href={route('tasks.export.excel', exportParams)}
                            className={exportLinkClasses}
                        >
                            Export Excel
                        </a>
                        <a
                            href={route('tasks.export.pdf', exportParams)}
                            className={exportLinkClasses}
                        >
                            Export PDF
                        </a>
                        {can.create && (
                            <Button onClick={openCreate}>New Task</Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="relative lg:col-span-2">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <svg
                                className="h-4 w-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            >
                                <circle cx="11" cy="11" r="7" />
                                <path d="M21 21l-4.35-4.35" />
                            </svg>
                        </span>
                        <input
                            type="search"
                            value={searchInput}
                            onChange={(event) =>
                                setSearchInput(event.target.value)
                            }
                            placeholder="Search tasks..."
                            className="block w-full rounded-md border-0 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600"
                        />
                    </div>

                    <div>
                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value as TaskStatus | '',
                                )
                            }
                            className={selectClasses}
                            aria-label="Filter by status"
                        >
                            <option value="">All statuses</option>
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <select
                            value={priorityFilter}
                            onChange={(event) =>
                                setPriorityFilter(
                                    event.target.value as TaskPriority | '',
                                )
                            }
                            className={selectClasses}
                            aria-label="Filter by priority"
                        >
                            <option value="">All priorities</option>
                            {priorityOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <Table
                    columns={columns}
                    rows={tasks.data}
                    rowKey={(task) => task.id}
                    emptyState={
                        <span className="text-sm text-gray-500">
                            No tasks found. Try adjusting the filters.
                        </span>
                    }
                />

                {tasks.meta.last_page > 1 && (
                    <nav className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                        <p className="text-sm text-gray-500">
                            Showing {start}&ndash;{end} of {tasks.meta.total}
                        </p>

                        <div className="flex flex-wrap gap-1">
                            {tasks.meta.links.map((link, index) =>
                                link.url ? (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        preserveScroll
                                        className={cn(
                                            'rounded-md border px-3 py-1.5 text-sm font-medium transition',
                                            link.active
                                                ? 'border-primary-600 bg-primary-600 text-white'
                                                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
                                        )}
                                    >
                                        {cleanLabel(link.label)}
                                    </Link>
                                ) : (
                                    <span
                                        key={index}
                                        className="rounded-md border border-transparent px-3 py-1.5 text-sm text-gray-400"
                                    >
                                        {cleanLabel(link.label)}
                                    </span>
                                ),
                            )}
                        </div>
                    </nav>
                )}
            </div>

            <TaskFormModal
                key={editingTask?.id ?? 'create'}
                open={formOpen}
                onClose={() => setFormOpen(false)}
                task={editingTask}
                users={users}
                customers={customers}
            />

            <DeleteTaskModal
                task={deletingTask}
                onClose={() => setDeletingTask(null)}
            />
        </AppLayout>
    );
}
