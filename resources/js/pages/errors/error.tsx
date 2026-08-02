import { Head, Link } from '@inertiajs/react';

interface ErrorInfo {
    title: string;
    message: string;
}

const errorMap: Record<number, ErrorInfo> = {
    403: {
        title: 'Forbidden',
        message:
            'You do not have permission to access this page. Contact your administrator if you believe this is a mistake.',
    },
    404: {
        title: 'Page Not Found',
        message:
            'The page you are looking for does not exist or may have been moved.',
    },
    419: {
        title: 'Session Expired',
        message:
            'Your session has expired. Please refresh the page and try again.',
    },
    500: {
        title: 'Server Error',
        message:
            'Something went wrong on our end. Please try again in a moment.',
    },
    503: {
        title: 'Service Unavailable',
        message:
            'The service is temporarily unavailable. Please check back shortly.',
    },
};

export default function ErrorPage({ status }: { status: number }) {
    const info: ErrorInfo =
        errorMap[status] ?? {
            title: 'Unexpected Error',
            message: 'Something went wrong. Please try again.',
        };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
            <Head title={info.title} />

            <p className="text-7xl font-bold text-primary-600">{status}</p>

            <h1 className="mt-4 text-2xl font-semibold text-gray-900">
                {info.title}
            </h1>

            <p className="mt-2 max-w-md text-center text-sm text-gray-500">
                {info.message}
            </p>

            <Link
                href="/"
                className="mt-8 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
            >
                Back to Home
            </Link>
        </div>
    );
}
