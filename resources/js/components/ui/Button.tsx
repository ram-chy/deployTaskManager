import { cn } from '@/utils/cn';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'outline'
    | 'ghost';

export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    children?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary:
        'bg-primary-600 text-white shadow-sm hover:bg-primary-700 focus-visible:outline-primary-600 active:bg-primary-800',
    secondary:
        'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-gray-400 active:bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-600 dark:hover:bg-gray-700 dark:active:bg-gray-700',
    danger:
        'bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:outline-red-600 active:bg-red-800',
    outline:
        'border border-primary-600 text-primary-600 hover:bg-primary-50 focus-visible:outline-primary-600 active:bg-primary-100 dark:border-primary-500 dark:text-primary-400 dark:hover:bg-primary-500/10 dark:active:bg-primary-500/20',
    ghost:
        'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-gray-400 active:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:active:bg-gray-700',
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3.5 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        { className, variant = 'primary', size = 'md', loading, disabled, children, ...props },
        ref,
    ) => (
        <button
            ref={ref}
            disabled={disabled || loading}
            className={cn(
                'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
                variantClasses[variant],
                sizeClasses[size],
                className,
            )}
            {...props}
        >
            {loading && (
                <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
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
            )}
            {children}
        </button>
    ),
);

Button.displayName = 'Button';

export default Button;
