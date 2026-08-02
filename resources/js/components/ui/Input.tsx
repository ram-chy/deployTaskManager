import { cn } from '@/utils/cn';
import { forwardRef, useId, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    leadingIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, hint, leadingIcon, id, ...props }, ref) => {
        const generatedId = useId();
        const inputId = id ?? generatedId;

        return (
            <div className="space-y-1.5">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-gray-700"
                    >
                        {label}
                    </label>
                )}

                <div className="relative">
                    {leadingIcon && (
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            {leadingIcon}
                        </span>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        className={cn(
                            'block w-full rounded-md border-0 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
                            leadingIcon ? 'pl-10' : '',
                            error &&
                                'ring-red-300 focus:ring-red-500',
                            className,
                        )}
                        aria-invalid={error ? true : undefined}
                        aria-describedby={
                            error
                                ? `${inputId}-error`
                                : hint
                                  ? `${inputId}-hint`
                                  : undefined
                        }
                        {...props}
                    />
                </div>

                {error ? (
                    <p
                        id={`${inputId}-error`}
                        className="text-xs text-red-600"
                    >
                        {error}
                    </p>
                ) : hint ? (
                    <p
                        id={`${inputId}-hint`}
                        className="text-xs text-gray-500"
                    >
                        {hint}
                    </p>
                ) : null}
            </div>
        );
    },
);

Input.displayName = 'Input';

export default Input;
