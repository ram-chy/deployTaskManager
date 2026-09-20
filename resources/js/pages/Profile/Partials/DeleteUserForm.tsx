import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

export default function DeleteUserForm({
    className = '',
}: {
    className?: string;
}) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Delete Account
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Once your account is deleted, all of its resources and data
                    will be permanently deleted. Before deleting your account,
                    please download any data or information that you wish to
                    retain.
                </p>
            </header>

            <Button variant="danger" onClick={confirmUserDeletion}>
                Delete Account
            </Button>

            <Modal
                open={confirmingUserDeletion}
                onClose={closeModal}
                title="Are you sure you want to delete your account?"
                description="Once your account is deleted, all of its resources and data will be permanently deleted. Please enter your password to confirm."
            >
                <form onSubmit={deleteUser} className="space-y-4">
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        ref={passwordInput}
                        label="Password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoFocus
                        placeholder="Password"
                        error={errors.password}
                    />

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            variant="secondary"
                            type="button"
                            onClick={closeModal}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="danger"
                            type="submit"
                            loading={processing}
                            disabled={processing}
                        >
                            Delete Account
                        </Button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
