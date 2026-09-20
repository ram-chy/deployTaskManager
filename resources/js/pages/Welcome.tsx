import Brand from '@/components/Brand';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

export default function Welcome({
    canLogin,
    canRegister,
}: PageProps<{
    canLogin: boolean;
    canRegister: boolean;
}>) {
    return (
        <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
            <Head title="Welcome" />

            <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-800 dark:bg-gray-900">
                <Brand className="flex items-center gap-2" />

                <div className="flex items-center gap-3">
                    {canLogin && (
                        <Link
                            href={route('login')}
                            className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                        >
                            Log in
                        </Link>
                    )}

                    {canRegister && (
                        <Link
                            href={route('register')}
                            className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
                        >
                            Register
                        </Link>
                    )}
                </div>
            </header>

            <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
                <span className="mb-6 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-500/10 dark:text-primary-300">
                    Internal Office Tool
                </span>

                <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
                    Office Task Management System
                </h1>

                <p className="mt-4 max-w-xl text-base text-gray-500 dark:text-gray-400">
                    Plan, assign, and track office tasks across your team.
                    TaskManager keeps your team organized and on schedule.
                </p>

                <div className="mt-8 flex items-center gap-4">
                    <Link
                        href={route('login')}
                        className="rounded-md bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
                    >
                        Get started
                    </Link>

                    {canRegister && (
                        <Link
                            href={route('register')}
                            className="rounded-md px-5 py-2.5 text-sm font-semibold text-primary-700 ring-1 ring-inset ring-primary-600 transition hover:bg-primary-50 dark:text-primary-400 dark:ring-primary-500 dark:hover:bg-primary-500/10"
                        >
                            Create account
                        </Link>
                    )}
                </div>
            </main>
        </div>
    );
}
