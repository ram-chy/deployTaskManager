import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import Input from '@/components/ui/Input';
import GuestLayout from '@/layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const DEMO_PASSWORD = 'password';

const DEMO_ACCOUNTS = [
    { role: 'Admin', email: 'admin@taskmanager.local' },
    { role: 'Manager', email: 'manager@taskmanager.local' },
    { role: 'Staff', email: 'staff@taskmanager.local' },
];

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
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Sign in to your account
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Enter your credentials to continue.
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
                            className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
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

            <DemoAccounts
                onPick={(email) => {
                    setData({ ...data, email, password: DEMO_PASSWORD });
                }}
            />

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                Don't have an account?{' '}
                <Link
                    href={route('register')}
                    className="font-medium text-primary-600 hover:text-primary-700"
                >
                    Register
                </Link>
            </p>
        </GuestLayout>
    );
}

function DemoAccounts({ onPick }: { onPick: (email: string) => void }) {
    return (
        <div className="mt-6 rounded-md border border-dashed border-gray-300 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Demo accounts &mdash; click one to fill the form.
            </p>

            <ul className="mt-2 space-y-1">
                {DEMO_ACCOUNTS.map((account) => (
                    <li key={account.email}>
                        <button
                            type="button"
                            onClick={() => onPick(account.email)}
                            className="flex w-full items-center justify-between rounded px-2 py-1 text-left text-xs text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <span className="font-medium">{account.role}</span>
                            <span className="font-mono">
                                {account.email}
                            </span>
                        </button>
                    </li>
                ))}
            </ul>

            <p className="mt-2 px-2 text-xs text-gray-500 dark:text-gray-400">
                Password for all:{' '}
                <code className="font-mono">{DEMO_PASSWORD}</code>
            </p>
        </div>
    );
}
