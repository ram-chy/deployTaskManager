import Button from '@/components/ui/Button';
import GuestLayout from '@/layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Verify your email
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Thanks for signing up! Before getting started, could you
                    verify your email address by clicking on the link we just
                    emailed to you? If you didn't receive the email, we will
                    gladly send you another.
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 rounded-md bg-green-50 px-3 py-2 text-sm font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <Button
                    type="submit"
                    className="w-full"
                    loading={processing}
                    disabled={processing}
                >
                    Resend Verification Email
                </Button>

                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="block w-full text-center text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                >
                    Log Out
                </Link>
            </form>
        </GuestLayout>
    );
}
