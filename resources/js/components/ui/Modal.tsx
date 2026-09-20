import { cn } from '@/utils/cn';
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Transition,
    TransitionChild,
} from '@headlessui/react';
import { Fragment, type ReactNode } from 'react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: ReactNode;
    description?: ReactNode;
    children?: ReactNode;
    footer?: ReactNode;
    size?: ModalSize;
}

const sizeClasses: Record<ModalSize, string> = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
};

export default function Modal({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    size = 'md',
}: ModalProps) {
    return (
        <Transition show={open} as={Fragment}>
            <Dialog
                onClose={onClose}
                className="relative z-50"
            >
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-900/50 transition-opacity" />
                </TransitionChild>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <DialogPanel
                                className={cn(
                                    'w-full transform overflow-hidden rounded-xl bg-white p-6 text-left shadow-xl transition-all dark:bg-gray-900 dark:ring-1 dark:ring-gray-800',
                                    sizeClasses[size],
                                )}
                            >
                                {(title || description) && (
                                    <div className="mb-4">
                                        {title && (
                                            <DialogTitle
                                                as="h3"
                                                className="text-base font-semibold text-gray-900 dark:text-gray-100"
                                            >
                                                {title}
                                            </DialogTitle>
                                        )}
                                        {description && (
                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                {description}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {children}

                                {footer && (
                                    <div className="mt-6 flex items-center justify-end gap-3">
                                        {footer}
                                    </div>
                                )}
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
