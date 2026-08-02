import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import GuestLayout from '@/layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Confirm Password" />

            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                    Confirm your password
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    This is a secure area of the application. Please confirm
                    your password before continuing.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <Input
                    id="password"
                    type="password"
                    name="password"
                    label="Password"
                    value={data.password}
                    autoFocus
                    autoComplete="current-password"
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                />

                <Button
                    type="submit"
                    className="w-full"
                    loading={processing}
                    disabled={processing}
                >
                    Confirm
                </Button>
            </form>
        </GuestLayout>
    );
}
