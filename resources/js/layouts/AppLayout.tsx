import { PropsWithChildren, useState } from 'react';
import PageLoader from '@/components/loading/PageLoader';
import NotificationProvider from '@/components/notification/NotificationProvider';
import ToastProvider from '@/components/toast/ToastProvider';
import Navbar from '@/layouts/partials/Navbar';
import Sidebar from '@/layouts/partials/Sidebar';

interface AppLayoutProps extends PropsWithChildren {
    title?: string;
}

export default function AppLayout({ title, children }: AppLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <ToastProvider>
            <NotificationProvider>
                <PageLoader />

                <div className="flex min-h-screen bg-gray-50">
                    <Sidebar
                        open={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                    />

                    <div className="flex min-w-0 flex-1 flex-col">
                        <Navbar
                            onMenuClick={() => setSidebarOpen(true)}
                            pageTitle={title}
                        />

                        <main className="flex-1 p-4 sm:p-6 lg:p-8">
                            {children}
                        </main>

                        <footer className="border-t border-gray-200 px-6 py-4 text-center text-xs text-gray-400">
                            &copy; {new Date().getFullYear()} Flexmania.
                            Internal use only.
                        </footer>
                    </div>
                </div>
            </NotificationProvider>
        </ToastProvider>
    );
}
