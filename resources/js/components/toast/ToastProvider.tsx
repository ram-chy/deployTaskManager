import { usePage } from '@inertiajs/react';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { cn } from '@/utils/cn';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    type: ToastType;
    message: string;
}

interface ToastContextValue {
    show: (message: string, type?: ToastType) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toastTypeClasses: Record<ToastType, string> = {
    success:
        'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300',
    error:
        'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
    info: 'border-primary-200 bg-primary-50 text-primary-800 dark:border-primary-800 dark:bg-primary-950 dark:text-primary-300',
};

const toastIconClasses: Record<ToastType, string> = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-primary-500',
};

const TOAST_DURATION = 4000;

export default function ToastProvider({ children }: { children: ReactNode }) {
    const { flash } = usePage().props;
    const [toasts, setToasts] = useState<Toast[]>([]);
    const counter = useRef(0);

    const remove = useCallback((id: number) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const show = useCallback(
        (message: string, type: ToastType = 'info') => {
            const id = ++counter.current;
            setToasts((current) => [...current, { id, type, message }]);
            window.setTimeout(() => remove(id), TOAST_DURATION);
        },
        [remove],
    );

    const success = useCallback(
        (message: string) => show(message, 'success'),
        [show],
    );
    const error = useCallback(
        (message: string) => show(message, 'error'),
        [show],
    );
    const info = useCallback(
        (message: string) => show(message, 'info'),
        [show],
    );

    useEffect(() => {
        if (flash?.success) {
            show(flash.success, 'success');
        }

        if (flash?.error) {
            show(flash.error, 'error');
        }

        if (flash?.info) {
            show(flash.info, 'info');
        }
    }, [flash, show]);

    return (
        <ToastContext.Provider value={{ show, success, error, info }}>
            {children}

            <div
                aria-live="polite"
                className="pointer-events-none fixed right-4 top-4 z-[60] flex w-full max-w-sm flex-col gap-2"
            >
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={cn(
                            'pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg',
                            toastTypeClasses[toast.type],
                        )}
                        role="status"
                    >
                        <span
                            className={cn(
                                'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                                toastIconClasses[toast.type],
                            )}
                        />
                        <p className="flex-1 text-sm font-medium">
                            {toast.message}
                        </p>
                        <button
                            type="button"
                            onClick={() => remove(toast.id)}
                            className="shrink-0 text-sm text-current opacity-50 transition hover:opacity-100"
                            aria-label="Dismiss notification"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextValue {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }

    return context;
}
