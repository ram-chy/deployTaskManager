import { PropsWithChildren } from 'react';
import Brand from '@/components/Brand';
import ToastProvider from '@/components/toast/ToastProvider';

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <ToastProvider>
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-950">
                <div className="mb-6 flex items-center gap-2">
                    <Brand className="flex items-center gap-2" />
                </div>

                <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800 sm:p-8">
                    {children}
                </div>
            </div>
        </ToastProvider>
    );
}
