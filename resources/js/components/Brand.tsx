import { Link } from '@inertiajs/react';

export default function Brand({ className = '' }: { className?: string }) {
    return (
        <Link href="/" className={className}>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white shadow-sm">
                F
            </span>
            <span className="text-lg font-semibold tracking-tight text-gray-900">
                Flex<span className="text-primary-600">mania</span>
            </span>
        </Link>
    );
}
