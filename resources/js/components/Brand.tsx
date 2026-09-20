import { Link } from '@inertiajs/react';

export default function Brand({ className = '' }: { className?: string }) {
    return (
        <Link href={route('welcome')} className={className}>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white shadow-sm">
                T
            </span>
            <span className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                Task<span className="text-primary-600">Manager</span>
            </span>
        </Link>
    );
}
