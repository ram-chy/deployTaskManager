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
                    'h-4 w-4 rounded border-gray-300 text-primary-600 shadow-sm focus:ring-2 focus:ring-primary-600 focus:ring-offset-0',
                    className,
                )}
                {...props}
            />
            {label && (
                <span className="text-sm text-gray-700">{label}</span>
            )}
        </label>
    ),
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
