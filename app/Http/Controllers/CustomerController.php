<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use App\Services\CustomerService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(CustomerService $service): Response
    {
        $this->authorize('viewAny', Customer::class);

        return Inertia::render('Customers/Index', [
            'customers' => CustomerResource::collection(
                $service->listCustomers(request('search')),
            )->response()->getData(true),
            'filters' => [
                'search' => request('search'),
            ],
            'can' => [
                'manage' => request()->user()->can('create', Customer::class),
            ],
        ]);
    }

    public function store(StoreCustomerRequest $request, CustomerService $service): RedirectResponse
    {
        $this->authorize('create', Customer::class);

        $service->createCustomer($request->validated());

        return back()->with('success', 'Customer created.');
    }

    public function update(UpdateCustomerRequest $request, CustomerService $service, Customer $customer): RedirectResponse
    {
        $this->authorize('update', $customer);

        $service->updateCustomer($customer, $request->validated());

        return back()->with('success', sprintf('Customer "%s" updated.', $customer->name));
    }

    public function destroy(CustomerService $service, Customer $customer): RedirectResponse
    {
        $this->authorize('delete', $customer);

        $service->deleteCustomer($customer);

        return back()->with('success', 'Customer deleted.');
    }
}
