import AppLayout from '@/layouts/AppLayout';
import Badge, { type BadgeVariant } from '@/components/ui/Badge';
import { Head, Link } from '@inertiajs/react';
import type { DashboardStats, Task, TaskStatus } from '@/types';
import type { ReactNode } from 'react';

const statusVariant: Record<TaskStatus, BadgeVariant> = {
    pending: 'warning',
    in_progress: 'info',
    under_review: 'primary',
    completed: 'success',
    cancelled: 'neutral',
};

const statusLabel: Record<TaskStatus, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    under_review: 'Under Review',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

interface StatCard {
    key: keyof DashboardStats;
    label: string;
    href: string;
    icon: ReactNode;
    accent: string;
}

interface DashboardProps {
    stats: DashboardStats;
    recentActivities: Task[];
}

const statCards: StatCard[] = [
    {
        key: 'pending',
        label: 'Pending',
        href: route('tasks.index', { status: 'pending' }),
        accent: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
        icon: (
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5h7a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h2z" />
                <path d="M9 5a2 2 0 012-2h2a2 2 0 012 2v2H9V5z" />
                <path d="M9 12h6M9 16h4" />
            </svg>
        ),
    },
    {
        key: 'in_progress',
        label: 'In Progress',
        href: route('tasks.index', { status: 'in_progress' }),
        accent: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400',
        icon: (
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8v4l3 3" />
                <circle cx="12" cy="12" r="9" />
            </svg>
        ),
    },
    {
        key: 'under_review',
        label: 'Under Review',
        href: route('tasks.index', { status: 'under_review' }),
        accent:
            'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400',
        icon: (
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                <circle cx="12" cy="12" r="3" />
            </svg>
        ),
    },
    {
        key: 'completed',
        label: 'Completed',
        href: route('tasks.index', { status: 'completed' }),
        accent:
            'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400',
        icon: (
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4" />
                <circle cx="12" cy="12" r="9" />
            </svg>
        ),
    },
    {
        key: 'cancelled',
        label: 'Cancelled',
        href: route('tasks.index', { status: 'cancelled' }),
        accent:
            'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
        icon: (
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M9 9l6 6M15 9l-6 6" />
            </svg>
        ),
    },
    {
        key: 'today',
        label: "Today's Tasks",
        href: route('tasks.index'),
        accent: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
        icon: (
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
        ),
    },
];

export default function Dashboard({ stats, recentActivities }: DashboardProps) {
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <AppLayout title="Dashboard">
            <Head title="Dashboard" />

            <div className="space-y-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                            Welcome back
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {today}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {statCards.map((card) => (
                        <Link
                            key={card.key}
                            href={card.href}
                            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`flex h-11 w-11 items-center justify-center rounded-lg ${card.accent}`}
                                    >
                                        {card.icon}
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            {card.label}
                                        </p>
                                        <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                            {stats[card.key]}
                                        </p>
                                    </div>
                                </div>
                                <svg
                                    className="h-4 w-4 text-gray-300 transition group-hover:text-gray-500 dark:text-gray-600 dark:group-hover:text-gray-400"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M9 18l6-6-6-6" />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                            Recent Activities
                        </h3>
                        <Link
                            href={route('tasks.index')}
                            className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                            View all
                        </Link>
                    </div>

                    {recentActivities.length === 0 ? (
                        <div className="px-5 py-12 text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
                                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 8v4l3 3" />
                                    <circle cx="12" cy="12" r="9" />
                                </svg>
                            </div>
<p className="text-sm text-gray-500 dark:text-gray-400">
                                    No activities yet. Task updates will appear here
                                    as the team gets to work.
                                </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                            {recentActivities.map((activity) => (
                                <li
                                    key={activity.id}
                                    className="flex items-center justify-between gap-4 px-5 py-3.5"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M9 5h7a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h2z" />
                                                <path d="M9 5a2 2 0 012-2h2a2 2 0 012 2v2H9V5z" />
                                            </svg>
                                        </span>
                                        <div className="min-w-0">
                                            <Link
                                                href={route('tasks.index')}
                                                className="block truncate text-sm font-medium text-gray-900 hover:text-primary-700 dark:text-gray-100 dark:hover:text-primary-400"
                                            >
                                                {activity.title}
                                            </Link>
                                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                                {activity.assignee
                                                    ? `${activity.assignee.name} · `
                                                    : ''}
                                                Updated {activity.updated_at}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={statusVariant[activity.status]}>
                                        {statusLabel[activity.status]}
                                    </Badge>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
