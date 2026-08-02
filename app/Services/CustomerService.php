<?php

namespace App\Services;

use App\Models\Customer;
use Illuminate\Pagination\LengthAwarePaginator;

class CustomerService extends AbstractService
{
    /**
     * Paginate customers, optionally filtered by a search term.
     */
    public function listCustomers(?string $search = null): LengthAwarePaginator
    {
        return Customer::query()
            ->when($search, function ($query, string $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();
    }

    public function createCustomer(array $data): Customer
    {
        return Customer::create($data);
    }

    public function updateCustomer(Customer $customer, array $data): Customer
    {
        $customer->update($data);

        return $customer->refresh();
    }

    public function deleteCustomer(Customer $customer): void
    {
        $customer->delete();
    }
}
