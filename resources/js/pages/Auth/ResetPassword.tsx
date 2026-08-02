import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import GuestLayout from '@/layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ResetPassword({
    token,
    email,
}: {
    token: string;
    email: string;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Reset Password" />

            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                    Reset your password
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    Choose a new password for your account.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <Input
                    id="email"
                    type="email"
                    name="email"
                    label="Email"
                    value={data.email}
                    autoComplete="username"
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                />

                <Input
                    id="password"
                    type="password"
                    name="password"
                    label="New Password"
                    value={data.password}
                    autoComplete="new-password"
                    autoFocus
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                />

                <Input
                    id="password_confirmation"
                    type="password"
                    name="password_confirmation"
                    label="Confirm New Password"
                    value={data.password_confirmation}
                    autoComplete="new-password"
                    onChange={(e) =>
                        setData('password_confirmation', e.target.value)
                    }
                    error={errors.password_confirmation}
                />

                <Button
                    type="submit"
                    className="w-full"
                    loading={processing}
                    disabled={processing}
                >
                    Reset Password
                </Button>
            </form>
        </GuestLayout>
    );
}
