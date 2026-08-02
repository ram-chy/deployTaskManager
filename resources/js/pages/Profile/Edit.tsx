import AppLayout from '@/layouts/AppLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <AppLayout title="Profile">
            <Head title="Profile" />

            <div className="mx-auto max-w-3xl space-y-6">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                    />
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <UpdatePasswordForm />
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <DeleteUserForm />
                </div>
            </div>
        </AppLayout>
    );
}
