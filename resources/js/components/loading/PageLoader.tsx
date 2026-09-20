import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function PageLoader() {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let timeout: number | undefined;

        const start = () => {
            window.clearTimeout(timeout);
            setLoading(true);
        };

        const finish = () => {
            timeout = window.setTimeout(() => setLoading(false), 200);
        };

        const stopStart = router.on('start', start);
        const stopFinish = router.on('finish', finish);

        return () => {
            window.clearTimeout(timeout);
            stopStart();
            stopFinish();
        };
    }, []);

    if (!loading) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-900/30 backdrop-blur-[1px]"
            aria-hidden="true"
        >
            <div className="flex flex-col items-center gap-3 rounded-xl bg-white px-6 py-5 shadow-xl dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
                <svg
                    className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400"
                    viewBox="0 0 24 24"
                    fill="none"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                </svg>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Loading...
                </span>
            </div>
        </div>
    );
}
