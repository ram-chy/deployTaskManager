import AppLayout from '@/layouts/AppLayout';
import Badge, { type BadgeVariant } from '@/components/ui/Badge';
import { Head, Link } from '@inertiajs/react';
import type { DashboardStats, Task, TaskStatus } from '@/types';
import type { ReactNode } from 'react';

const statusVariant: Record<TaskStatus, BadgeVariant> = {
    submit_for_design: 'warning',
    send_for_approve: 'info',
    approved: 'success',
    send_for_print: 'primary',
    print_complete: 'neutral',
};

const statusLabel: Record<TaskStatus, string> = {
    submit_for_design: 'Submit For Design',
    send_for_approve: 'Send for Approve',
    approved: 'Approved',
    send_for_print: 'Send for Print',
    print_complete: 'Print Complete',
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
        key: 'submit_for_design',
        label: 'Submit For Design',
        href: route('tasks.index', { status: 'submit_for_design' }),
        accent: 'bg-amber-50 text-amber-600',
        icon: (
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5h7a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h2z" />
                <path d="M9 5a2 2 0 012-2h2a2 2 0 012 2v2H9V5z" />
                <path d="M9 12h6M9 16h4" />
            </svg>
        ),
    },
    {
        key: 'send_for_approve',
        label: 'Send for Approve',
        href: route('tasks.index', { status: 'send_for_approve' }),
        accent: 'bg-sky-50 text-sky-600',
        icon: (
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
        ),
    },
    {
        key: 'approved',
        label: 'Approved',
        href: route('tasks.index', { status: 'approved' }),
        accent: 'bg-green-50 text-green-600',
        icon: (
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4" />
                <circle cx="12" cy="12" r="9" />
            </svg>
        ),
    },
    {
        key: 'send_for_print',
        label: 'Send for Print',
        href: route('tasks.index', { status: 'send_for_print' }),
        accent: 'bg-primary-50 text-primary-600',
        icon: (
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9V3h12v6" />
                <rect x="6" y="14" width="12" height="7" rx="1" />
                <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
            </svg>
        ),
    },
    {
        key: 'print_complete',
        label: 'Print Complete',
        href: route('tasks.index', { status: 'print_complete' }),
        accent: 'bg-gray-100 text-gray-600',
        icon: (
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6H9a2 2 0 01-2-2V3a2 2 0 012-2h11a2 2 0 012 2v1a2 2 0 01-2 2z" />
                <path d="M2 10h20v6a2 2 0 01-2 2h-2v4H6v-4H4a2 2 0 01-2-2v-6z" />
                <path d="M16 16h.01" />
            </svg>
        ),
    },
    {
        key: 'today',
        label: "Today's Tasks",
        href: route('tasks.index'),
        accent: 'bg-rose-50 text-rose-600',
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
                        <h2 className="text-2xl font-semibold text-gray-900">
                            Welcome back
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">{today}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {statCards.map((card) => (
                        <Link
                            key={card.key}
                            href={card.href}
                            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`flex h-11 w-11 items-center justify-center rounded-lg ${card.accent}`}
                                    >
                                        {card.icon}
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">
                                            {card.label}
                                        </p>
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {stats[card.key]}
                                        </p>
                                    </div>
                                </div>
                                <svg
                                    className="h-4 w-4 text-gray-300 transition group-hover:text-gray-500"
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

                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                        <h3 className="text-base font-semibold text-gray-900">
                            Recent Activities
                        </h3>
                        <Link
                            href={route('tasks.index')}
                            className="text-sm font-medium text-primary-600 hover:text-primary-700"
                        >
                            View all
                        </Link>
                    </div>

                    {recentActivities.length === 0 ? (
                        <div className="px-5 py-12 text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 8v4l3 3" />
                                    <circle cx="12" cy="12" r="9" />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-500">
                                No activities yet. Task updates will appear here
                                as the team gets to work.
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {recentActivities.map((activity) => (
                                <li
                                    key={activity.id}
                                    className="flex items-center justify-between gap-4 px-5 py-3.5"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M9 5h7a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h2z" />
                                                <path d="M9 5a2 2 0 012-2h2a2 2 0 012 2v2H9V5z" />
                                            </svg>
                                        </span>
                                        <div className="min-w-0">
                                            <Link
                                                href={route('tasks.index')}
                                                className="block truncate text-sm font-medium text-gray-900 hover:text-primary-700"
                                            >
                                                {activity.title}
                                            </Link>
                                            <p className="mt-0.5 text-xs text-gray-500">
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
