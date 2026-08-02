import AppLayout from '@/layouts/AppLayout';
import Badge, { type BadgeVariant } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Table, { type TableColumn } from '@/components/ui/Table';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/utils/cn';

interface Role {
    id: number;
    name: string;
    slug: string;
}

interface UserItem {
    id: number;
    name: string;
    email: string;
    created_at: string;
    roles: Role[];
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface UsersProps {
    users: {
        data: UserItem[];
        meta: {
            current_page: number;
            last_page: number;
            total: number;
            links: PaginationLink[];
        };
    };
    roles: Role[];
}

interface UserFormValues {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role_id: number | '';
}

const emptyForm: UserFormValues = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_id: '',
};

const roleVariant: Record<string, BadgeVariant> = {
    admin: 'primary',
    manager: 'info',
    staff: 'neutral',
};

const cleanLabel = (label: string): string =>
    label.replace('&laquo;', '\u00ab').replace('&raquo;', '\u00bb').trim();

interface UserFormModalProps {
    open: boolean;
    onClose: () => void;
    roles: Role[];
    editingUser?: UserItem | null;
}

function UserFormModal({ open, onClose, roles, editingUser }: UserFormModalProps) {
    const { data, setData, errors, processing, post, patch, reset } =
        useForm<UserFormValues>(emptyForm);

    useEffect(() => {
        if (open) {
            setData({
                name: editingUser?.name ?? '',
                email: editingUser?.email ?? '',
                password: '',
                password_confirmation: '',
                role_id: editingUser?.roles[0]?.id ?? '',
            });
        }
    }, [open, editingUser, setData]);

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        if (editingUser) {
            patch(route('users.update', editingUser.id), {
                preserveScroll: true,
                onSuccess: () => handleClose(),
            });
        } else {
            post(route('users.store'), {
                preserveScroll: true,
                onSuccess: () => handleClose(),
            });
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title={editingUser ? 'Edit User' : 'Add User'}
            description={
                editingUser
                    ? `Update ${editingUser.name}'s profile and role.`
                    : 'Create a new user account and assign their role.'
            }
            size="lg"
            footer={
                <>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="user-form"
                        loading={processing}
                    >
                        {editingUser ? 'Save Changes' : 'Create User'}
                    </Button>
                </>
            }
        >
            <form id="user-form" onSubmit={submit} className="space-y-4">
                <Input
                    label="Name"
                    value={data.name}
                    onChange={(event) => setData('name', event.target.value)}
                    error={errors.name}
                    required
                    autoFocus
                />

                <Input
                    label="Email"
                    type="email"
                    value={data.email}
                    onChange={(event) => setData('email', event.target.value)}
                    error={errors.email}
                    required
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        label="Password"
                        type="password"
                        value={data.password}
                        onChange={(event) =>
                            setData('password', event.target.value)
                        }
                        error={errors.password}
                        hint={
                            editingUser
                                ? 'Leave blank to keep the current password.'
                                : undefined
                        }
                        required={!editingUser}
                    />
                    <Input
                        label="Confirm Password"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(event) =>
                            setData('password_confirmation', event.target.value)
                        }
                        error={errors.password_confirmation}
                        required={!editingUser}
                    />
                </div>

                <div className="space-y-1.5">
                    <label
                        htmlFor="user-role"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Role
                    </label>
                    <select
                        id="user-role"
                        value={data.role_id}
                        onChange={(event) =>
                            setData('role_id', Number(event.target.value))
                        }
                        className="block w-full rounded-md border-0 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600"
                    >
                        <option value="">Select a role...</option>
                        {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                                {role.name}
                            </option>
                        ))}
                    </select>
                    {errors.role_id && (
                        <p className="text-xs text-red-600">{errors.role_id}</p>
                    )}
                </div>
            </form>
        </Modal>
    );
}

export default function UsersIndex({ users, roles }: UsersProps) {
    const [savingId, setSavingId] = useState<number | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);

    const openCreate = () => {
        setEditingUser(null);
        setFormOpen(true);
    };

    const openEdit = (user: UserItem) => {
        setEditingUser(user);
        setFormOpen(true);
    };

    const columns = useMemo<Array<TableColumn<UserItem>>>(
        () => [
            {
                key: 'name',
                header: 'Name',
                cell: (user) => (
                    <span className="font-medium text-gray-900">
                        {user.name}
                    </span>
                ),
            },
            {
                key: 'email',
                header: 'Email',
                cell: (user) => (
                    <span className="text-gray-500">{user.email}</span>
                ),
            },
            {
                key: 'roles',
                header: 'Current Role',
                cell: (user) =>
                    user.roles.length === 0 ? (
                        <Badge variant="neutral">No role</Badge>
                    ) : (
                        <div className="flex flex-wrap gap-1">
                            {user.roles.map((role) => (
                                <Badge
                                    key={role.id}
                                    variant={roleVariant[role.slug] ?? 'neutral'}
                                >
                                    {role.name}
                                </Badge>
                            ))}
                        </div>
                    ),
            },
            {
                key: 'role-select',
                header: 'Change Role',
                cell: (user) => (
                    <select
                        value={user.roles[0]?.id ?? ''}
                        onChange={(event) =>
                            updateRole(user, Number(event.target.value))
                        }
                        disabled={savingId === user.id}
                        className="block w-full rounded-md border-0 bg-white px-2.5 py-1.5 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                        aria-label={`Change role for ${user.name}`}
                    >
                        <option value="">No role</option>
                        {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                                {role.name}
                            </option>
                        ))}
                    </select>
                ),
            },
            {
                key: 'joined',
                header: 'Joined',
                cell: (user) => (
                    <span className="text-gray-500">{user.created_at}</span>
                ),
            },
            {
                key: 'actions',
                header: 'Actions',
                cell: (user) => (
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => openEdit(user)}
                    >
                        Edit
                    </Button>
                ),
            },
        ],
        [roles, savingId],
    );

    const updateRole = (user: UserItem, roleId: number) => {
        if (!roleId || savingId === user.id) {
            return;
        }

        setSavingId(user.id);

        router.patch(
            route('users.role.update', user.id),
            { role_id: roleId },
            {
                preserveScroll: true,
                onFinish: () => setSavingId(null),
            },
        );
    };

    const start = users.meta.total === 0 ? 0 : (users.meta.current_page - 1) * users.data.length + 1;
    const end = Math.min(users.meta.current_page * users.data.length, users.meta.total);

    return (
        <AppLayout title="Users">
            <Head title="Users" />

            <div className="space-y-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900">
                            Users
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage team members and their roles.
                        </p>
                    </div>

                    <Button onClick={openCreate}>New User</Button>
                </div>

                <Table
                    columns={columns}
                    rows={users.data}
                    rowKey={(user) => user.id}
                    emptyState={
                        <span className="text-sm text-gray-500">
                            No users found.
                        </span>
                    }
                />

                {users.meta.last_page > 1 && (
                    <nav className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                        <p className="text-sm text-gray-500">
                            Showing {start}&ndash;{end} of {users.meta.total}
                        </p>

                        <div className="flex flex-wrap gap-1">
                            {users.meta.links.map((link, index) =>
                                link.url ? (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        preserveScroll
                                        className={cn(
                                            'rounded-md border px-3 py-1.5 text-sm font-medium transition',
                                            link.active
                                                ? 'border-primary-600 bg-primary-600 text-white'
                                                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
                                        )}
                                    >
                                        {cleanLabel(link.label)}
                                    </Link>
                                ) : (
                                    <span
                                        key={index}
                                        className="rounded-md border border-transparent px-3 py-1.5 text-sm text-gray-400"
                                    >
                                        {cleanLabel(link.label)}
                                    </span>
                                ),
                            )}
                        </div>
                    </nav>
                )}
            </div>

            <UserFormModal
                open={formOpen}
                onClose={() => setFormOpen(false)}
                roles={roles}
                editingUser={editingUser}
            />
        </AppLayout>
    );
}
