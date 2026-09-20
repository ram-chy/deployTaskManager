import { cn } from '@/utils/cn';
import { forwardRef, type InputHTMLAttributes } from 'react';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, label, ...props }, ref) => (
        <label className="flex cursor-pointer items-center gap-2">
            <input
                ref={ref}
                type="checkbox"
                className={cn(
                    'h-4 w-4 rounded border-gray-300 bg-white text-primary-600 shadow-sm focus:ring-2 focus:ring-primary-600 focus:ring-offset-0 dark:border-gray-600 dark:bg-gray-800 dark:checked:bg-primary-500',
                    className,
                )}
                {...props}
            />
            {label && (
                <span className="text-sm text-gray-700 dark:text-gray-300">
                    {label}
                </span>
            )}
        </label>
    ),
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
