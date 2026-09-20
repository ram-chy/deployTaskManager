import { Link, usePage } from '@inertiajs/react';
import { cn } from '@/utils/cn';
import Brand from '@/components/Brand';

interface NavItem {
    label: string;
    href: string;
    active: () => boolean;
    icon: React.ReactNode;
}

interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

const usersIcon = (
    <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
);

const customersIcon = (
    <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
);

const tasksIcon = (
    <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M9 5h7a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h2z" />
        <path d="M9 5a2 2 0 012-2h2a2 2 0 012 2v2H9V5z" />
        <path d="M9 12l2 2 4-4" />
    </svg>
);

export default function Sidebar({ open, onClose }: SidebarProps) {
    const { user } = usePage().props.auth;
    const isAdmin = user.roles.some((role) => role.slug === 'admin');

    const navItems: NavItem[] = [
        {
            label: 'Dashboard',
            href: route('dashboard'),
            active: () => route().current('dashboard'),
            icon: (
                <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <rect x="3" y="3" width="7" height="9" rx="1" />
                    <rect x="14" y="3" width="7" height="5" rx="1" />
                    <rect x="14" y="12" width="7" height="9" rx="1" />
                    <rect x="3" y="16" width="7" height="5" rx="1" />
                </svg>
            ),
        },
        {
            label: 'Tasks',
            href: route('tasks.index'),
            active: () => route().current('tasks.index'),
            icon: tasksIcon,
        },
        {
            label: 'Customers',
            href: route('customers.index'),
            active: () => route().current('customers.index'),
            icon: customersIcon,
        },
        ...(isAdmin
            ? [
                  {
                      label: 'Users',
                      href: route('users.index'),
                      active: () => route().current('users.index'),
                      icon: usersIcon,
                  },
              ]
            : []),
    ];

    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 z-30 bg-gray-900/50 lg:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col border-r border-gray-200 bg-white transition-transform duration-200 dark:border-gray-800 dark:bg-gray-900 lg:static lg:translate-x-0',
                    open ? 'translate-x-0' : '-translate-x-full',
                )}
            >
                <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-5 dark:border-gray-800">
                    <Brand className="flex items-center gap-2" />
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                    <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        Main Menu
                    </p>

                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                                item.active()
                                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100',
                            )}
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="border-t border-gray-200 p-4 text-xs text-gray-400 dark:border-gray-800 dark:text-gray-500">
                    v0.2.0 &middot; Roles &amp; Permissions
                </div>
            </aside>
        </>
    );
}
