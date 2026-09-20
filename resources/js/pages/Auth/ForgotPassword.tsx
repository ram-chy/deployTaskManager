import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import GuestLayout from '@/layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Forgot your password?
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Enter your email address and we will send you a link to
                    reset your password.
                </p>
            </div>

            {status && (
                <div className="mb-4 rounded-md bg-green-50 px-3 py-2 text-sm font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <Input
                    id="email"
                    type="email"
                    name="email"
                    label="Email"
                    value={data.email}
                    autoFocus
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                />

                <Button
                    type="submit"
                    className="w-full"
                    loading={processing}
                    disabled={processing}
                >
                    Email Password Reset Link
                </Button>
            </form>
        </GuestLayout>
    );
}
