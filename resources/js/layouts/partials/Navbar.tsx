import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import NotificationBell from '@/components/notification/NotificationBell';
import { cn } from '@/utils/cn';

interface NavbarProps {
    onMenuClick: () => void;
    pageTitle?: string;
}

export default function Navbar({ onMenuClick, pageTitle }: NavbarProps) {
    const user = usePage().props.auth.user;
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const initials = user.name
        .split(' ')
        .map((part) => part.charAt(0))
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const roleName = user.roles[0]?.name;

    return (
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 lg:hidden"
                    aria-label="Toggle sidebar"
                >
                    <svg
                        className="h-6 w-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    >
                        <path d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <h1 className="text-base font-semibold text-gray-900 sm:text-lg">
                    {pageTitle}
                </h1>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
                <NotificationBell />

                <div className="relative" ref={menuRef}>
                    <button
                    type="button"
                    onClick={() => setMenuOpen((value) => !value)}
                    className="flex items-center gap-3 rounded-lg p-1.5 transition hover:bg-gray-100"
                >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                        {initials}
                    </span>
                    <span className="hidden text-sm font-medium text-gray-700 sm:block">
                        {user.name}
                    </span>
                    {roleName && (
                        <span className="hidden rounded-md bg-primary-50 px-1.5 py-0.5 text-xs font-medium text-primary-700 ring-1 ring-inset ring-primary-600/20 sm:block">
                            {roleName}
                        </span>
                    )}
                    <svg
                        className="hidden h-4 w-4 text-gray-400 sm:block"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>

                {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                        <div className="border-b border-gray-100 px-4 py-2.5">
                            <p className="truncate text-sm font-medium text-gray-800">
                                {user.name}
                            </p>
                            <p className="truncate text-xs text-gray-500">
                                {user.email}
                            </p>
                        </div>

                        <Link
                            href={route('profile.edit')}
                            onClick={() => setMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                        >
                            Profile
                        </Link>

                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="block w-full px-4 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                        >
                            Log Out
                        </Link>
                    </div>
                )}
                </div>
            </div>
        </header>
    );
}
