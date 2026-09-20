import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { useNotification } from '@/components/notification/NotificationProvider';
import { cn } from '@/utils/cn';

export default function NotificationBell() {
    const { unreadCount, items, markAllRead } = useNotification();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                ref.current &&
                !ref.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="relative rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                aria-label="Notifications"
            >
                <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>

                {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:shadow-black/30">
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            Notifications
                        </p>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={() => void markAllRead()}
                                className="text-xs font-medium text-primary-600 transition hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {items.length === 0 ? (
                        <div className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                            You&rsquo;re all caught up.
                        </div>
                    ) : (
                        <ul className="max-h-96 divide-y divide-gray-100 overflow-y-auto dark:divide-gray-700">
                            {items.map((item) =>
                                item.task_id ? (
                                    <li key={item.id}>
                                        <Link
                                            href={route('tasks.index')}
                                            onClick={() => setOpen(false)}
                                            className={cn(
                                                'block px-4 py-3 transition hover:bg-gray-50 dark:hover:bg-gray-700/60',
                                                !item.read_at &&
                                                    'bg-primary-50/50 dark:bg-primary-500/10',
                                            )}
                                        >
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {item.message}
                                            </p>
                                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                                {item.created_at}
                                            </p>
                                        </Link>
                                    </li>
                                ) : (
                                    <li
                                        key={item.id}
                                        className={cn(
                                            'px-4 py-3',
                                            !item.read_at &&
                                                'bg-primary-50/50 dark:bg-primary-500/10',
                                        )}
                                    >
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {item.message}
                                        </p>
                                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                            {item.created_at}
                                        </p>
                                    </li>
                                ),
                            )}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
