import { cn } from '@/utils/cn';
import { forwardRef, type HTMLAttributes } from 'react';

export type BadgeVariant =
    | 'neutral'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'primary';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
    neutral: 'bg-gray-100 text-gray-700 ring-gray-500/10 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-500/30',
    success:
        'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/30',
    warning:
        'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30',
    danger:
        'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/30',
    info: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-500/30',
    primary:
        'bg-primary-50 text-primary-700 ring-primary-600/20 dark:bg-primary-500/10 dark:text-primary-300 dark:ring-primary-500/30',
};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = 'neutral', ...props }, ref) => (
        <span
            ref={ref}
            className={cn(
                'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
                variantClasses[variant],
                className,
            )}
            {...props}
        />
    ),
);

Badge.displayName = 'Badge';

export default Badge;
