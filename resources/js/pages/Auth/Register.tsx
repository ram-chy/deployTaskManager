import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import GuestLayout from '@/layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Create your account
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Register to start managing your tasks.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <Input
                    id="name"
                    type="text"
                    name="name"
                    label="Name"
                    value={data.name}
                    autoComplete="name"
                    autoFocus
                    onChange={(e) => setData('name', e.target.value)}
                    error={errors.name}
                />

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
                    label="Password"
                    value={data.password}
                    autoComplete="new-password"
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                />

                <Input
                    id="password_confirmation"
                    type="password"
                    name="password_confirmation"
                    label="Confirm Password"
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
                    Register
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                Already have an account?{' '}
                <Link
                    href={route('login')}
                    className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                    Log in
                </Link>
            </p>
        </GuestLayout>
    );
}