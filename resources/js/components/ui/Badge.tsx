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
    neutral: 'bg-gray-100 text-gray-700 ring-gray-500/10',
    success: 'bg-green-50 text-green-700 ring-green-600/20',
    warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    danger: 'bg-red-50 text-red-700 ring-red-600/20',
    info: 'bg-sky-50 text-sky-700 ring-sky-600/20',
    primary: 'bg-primary-50 text-primary-700 ring-primary-600/20',
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
