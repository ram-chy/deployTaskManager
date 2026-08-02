import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import Input from '@/components/ui/Input';
import GuestLayout from '@/layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                    Sign in to your account
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    Enter your credentials to continue.
                </p>
            </div>

            {status && (
                <div className="mb-4 rounded-md bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
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
                    autoComplete="username"
                    autoFocus
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                />

                <Input
                    id="password"
                    type="password"
                    name="password"
                    label="Password"
                    value={data.password}
                    autoComplete="current-password"
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                />

                <div className="flex items-center justify-between">
                    <Checkbox
                        name="remember"
                        label="Remember me"
                        checked={data.remember}
                        onChange={(e) =>
                            setData('remember', e.target.checked)
                        }
                    />

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm font-medium text-primary-600 hover:text-primary-700"
                        >
                            Forgot your password?
                        </Link>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    loading={processing}
                    disabled={processing}
                >
                    Log in
                </Button>
            </form>
        </GuestLayout>
    );
}
