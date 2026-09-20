import AppLayout from '@/layouts/AppLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Table, { type TableColumn } from '@/components/ui/Table';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/utils/cn';
import type { Customer } from '@/types';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface CustomersProps {
    customers: {
        data: Customer[];
        meta: {
            current_page: number;
            last_page: number;
            total: number;
            links: PaginationLink[];
        };
    };
    filters: {
        search: string | null;
    };
    can: {
        manage: boolean;
    };
}

interface CustomerFormValues {
    name: string;
    email: string;
    phone: string;
    notes: string;
}

const emptyForm: CustomerFormValues = {
    name: '',
    email: '',
    phone: '',
    notes: '',
};

const cleanLabel = (label: string): string =>
    label.replace('&laquo;', '\u00ab').replace('&raquo;', '\u00bb').trim();

interface CustomerFormModalProps {
    open: boolean;
    onClose: () => void;
    customer: Customer | null;
}

function CustomerFormModal({ open, onClose, customer }: CustomerFormModalProps) {
    const isEditing = customer !== null;

    const { data, setData, errors, processing, post, patch, reset } =
        useForm<CustomerFormValues>(
            customer
                ? {
                      name: customer.name,
                      email: customer.email ?? '',
                      phone: customer.phone ?? '',
                      notes: customer.notes ?? '',
                  }
                : emptyForm,
        );

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        if (isEditing && customer) {
            patch(route('customers.update', customer.id), {
                preserveScroll: true,
                onSuccess: () => handleClose(),
            });
        } else {
            post(route('customers.store'), {
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
            title={isEditing ? 'Edit Customer' : 'Add Customer'}
            description={
                isEditing
                    ? 'Update the customer details below.'
                    : 'Record a new customer.'
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
                        form="customer-form"
                        loading={processing}
                    >
                        {isEditing ? 'Save Changes' : 'Create Customer'}
                    </Button>
                </>
            }
        >
            <form id="customer-form" onSubmit={submit} className="space-y-4">
                <Input
                    label="Name"
                    value={data.name}
                    onChange={(event) => setData('name', event.target.value)}
                    error={errors.name}
                    required
                    autoFocus
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        label="Email"
                        type="email"
                        value={data.email}
                        onChange={(event) => setData('email', event.target.value)}
                        error={errors.email}
                    />
                    <Input
                        label="Phone"
                        type="tel"
                        value={data.phone}
                        onChange={(event) => setData('phone', event.target.value)}
                        error={errors.phone}
                    />
                </div>

                <div className="space-y-1.5">
                    <label
                        htmlFor="customer-notes"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        Notes
                    </label>
                    <textarea
                        id="customer-notes"
                        rows={3}
                        value={data.notes}
                        onChange={(event) => setData('notes', event.target.value)}
                        className="block w-full rounded-md border-0 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-600 dark:placeholder:text-gray-500 dark:focus:ring-primary-500"
                    />
                    {errors.notes && (
                        <p className="text-xs text-red-600 dark:text-red-400">{errors.notes}</p>
                    )}
                </div>
            </form>
        </Modal>
    );
}

interface DeleteCustomerModalProps {
    customer: Customer | null;
    onClose: () => void;
}

function DeleteCustomerModal({ customer, onClose }: DeleteCustomerModalProps) {
    const [processing, setProcessing] = useState(false);

    const confirmDelete = () => {
        if (!customer) {
            return;
        }

        setProcessing(true);

        router.delete(route('customers.destroy', customer.id), {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
            onSuccess: () => onClose(),
        });
    };

    return (
        <Modal
            open={customer !== null}
            onClose={onClose}
            title="Delete Customer"
            description={
                customer
                    ? `Are you sure you want to delete "${customer.name}"? This action cannot be undone.`
                    : undefined
            }
            size="sm"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={confirmDelete}
                        loading={processing}
                    >
                        Delete
                    </Button>
                </>
            }
        />
    );
}

export default function CustomersIndex({
    customers,
    filters,
    can,
}: CustomersProps) {
    const [searchInput, setSearchInput] = useState(filters.search ?? '');
    const [formOpen, setFormOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(
        null,
    );
    const [deletingCustomer, setDeletingCustomer] =
        useState<Customer | null>(null);
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;

            return;
        }

        if (searchTimer.current) {
            clearTimeout(searchTimer.current);
        }

        searchTimer.current = setTimeout(() => {
            router.get(
                route('customers.index'),
                { search: searchInput || undefined },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 300);

        return () => {
            if (searchTimer.current) {
                clearTimeout(searchTimer.current);
            }
        };
    }, [searchInput]);

    const openCreate = () => {
        setEditingCustomer(null);
        setFormOpen(true);
    };

    const openEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setFormOpen(true);
    };

    const columns = useMemo<Array<TableColumn<Customer>>>(
        () => [
            {
                key: 'name',
                header: 'Name',
                cell: (customer) => (
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                        {customer.name}
                    </span>
                ),
            },
            {
                key: 'email',
                header: 'Email',
                cell: (customer) => (
                    <span className="text-gray-500 dark:text-gray-400">
                        {customer.email ?? (
                            <span className="text-gray-400 dark:text-gray-500">&mdash;</span>
                        )}
                    </span>
                ),
            },
            {
                key: 'phone',
                header: 'Phone',
                cell: (customer) => (
                    <span className="text-gray-500 dark:text-gray-400">
                        {customer.phone ?? (
                            <span className="text-gray-400 dark:text-gray-500">&mdash;</span>
                        )}
                    </span>
                ),
            },
            {
                key: 'notes',
                header: 'Notes',
                cell: (customer) => (
                    <span className="line-clamp-1 max-w-xs text-gray-500 dark:text-gray-400">
                        {customer.notes ?? (
                            <span className="text-gray-400 dark:text-gray-500">&mdash;</span>
                        )}
                    </span>
                ),
            },
            {
                key: 'created_at',
                header: 'Added',
                cell: (customer) => (
                    <span className="text-gray-500 dark:text-gray-400">{customer.created_at}</span>
                ),
            },
            ...(can.manage
                ? [
                      {
                          key: 'actions',
                          header: 'Actions',
                          cell: (customer: Customer) => (
                              <div className="flex items-center gap-2">
                                  <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openEdit(customer)}
                                  >
                                      Edit
                                  </Button>
                                  <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                                      onClick={() =>
                                          setDeletingCustomer(customer)
                                      }
                                  >
                                      Delete
                                  </Button>
                              </div>
                          ),
                      },
                  ]
                : []),
        ],
        [can.manage],
    );

    const start =
        customers.meta.total === 0
            ? 0
            : (customers.meta.current_page - 1) * customers.data.length + 1;
    const end = Math.min(
        customers.meta.current_page * customers.data.length,
        customers.meta.total,
    );

    return (
        <AppLayout title="Customers">
            <Head title="Customers" />

            <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                            Customers
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            View and manage your customer records.
                        </p>
                    </div>

                    {can.manage && (
                        <Button onClick={openCreate}>Add Customer</Button>
                    )}
                </div>

                <div className="max-w-sm">
                    <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500">
                            <svg
                                className="h-4 w-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            >
                                <circle cx="11" cy="11" r="7" />
                                <path d="M21 21l-4.35-4.35" />
                            </svg>
                        </span>
                        <input
                            type="search"
                            value={searchInput}
                            onChange={(event) =>
                                setSearchInput(event.target.value)
                            }
                            placeholder="Search by name, email or phone..."
                            className="block w-full rounded-md border-0 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-600 dark:placeholder:text-gray-500 dark:focus:ring-primary-500"
                        />
                    </div>
                </div>

                <Table
                    columns={columns}
                    rows={customers.data}
                    rowKey={(customer) => customer.id}
                    emptyState={
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            No customers found.                            {filters.search
                                ? ' Try adjusting your search.'
                                : ''}
                        </span>
                    }
                />

                {customers.meta.last_page > 1 && (
                    <nav className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {start}&ndash;{end} of {customers.meta.total}
                        </p>

                        <div className="flex flex-wrap gap-1">
                            {customers.meta.links.map((link, index) =>
                                link.url ? (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        preserveScroll
                                        className={cn(
                                            'rounded-md border px-3 py-1.5 text-sm font-medium transition',
                                            link.active
                                                ? 'border-primary-600 bg-primary-600 text-white'
                                                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
                                        )}
                                    >
                                        {cleanLabel(link.label)}
                                    </Link>
                                ) : (
                                    <span
                                        key={index}
                                        className="rounded-md border border-transparent px-3 py-1.5 text-sm text-gray-400 dark:text-gray-600"
                                    >
                                        {cleanLabel(link.label)}
                                    </span>
                                ),
                            )}
                        </div>
                    </nav>
                )}
            </div>

            <CustomerFormModal
                key={editingCustomer?.id ?? 'create'}
                open={formOpen}
                onClose={() => setFormOpen(false)}
                customer={editingCustomer}
            />

            <DeleteCustomerModal
                customer={deletingCustomer}
                onClose={() => setDeletingCustomer(null)}
            />
        </AppLayout>
    );
}
