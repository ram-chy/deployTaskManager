<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
    }

    public function test_customers_index_requires_authentication(): void
    {
        $this->get('/customers')->assertRedirect('/login');
    }

    public function test_any_authenticated_user_can_view_customers(): void
    {
        $staff = User::factory()->create();
        $staff->assignRole('staff');

        Customer::factory()->count(3)->create();

        $this->actingAs($staff)
            ->get('/customers')
            ->assertOk();
    }

    public function test_only_admins_can_create_customers(): void
    {
        $manager = User::factory()->create();
        $manager->assignRole('manager');

        $this->actingAs($manager)
            ->post('/customers', [
                'name' => 'New Customer',
                'email' => 'new@example.com',
            ])
            ->assertForbidden();

        $this->assertDatabaseCount('customers', 0);
    }

    public function test_admin_can_create_a_customer(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $this->actingAs($admin)
            ->post('/customers', [
                'name' => 'Acme Corp',
                'email' => 'hello@acme.example',
                'phone' => '+1 555 010 0000',
                'notes' => 'Key client',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('customers', [
            'name' => 'Acme Corp',
            'email' => 'hello@acme.example',
        ]);
    }

    public function test_customer_creation_validation(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        Customer::factory()->create(['email' => 'taken@example.com']);

        $this->actingAs($admin)
            ->from('/customers')
            ->post('/customers', [
                'name' => '',
                'email' => 'not-an-email',
            ])
            ->assertSessionHasErrors(['name', 'email']);

        $this->actingAs($admin)
            ->from('/customers')
            ->post('/customers', [
                'name' => 'Duplicate',
                'email' => 'taken@example.com',
            ])
            ->assertSessionHasErrors(['email']);
    }

    public function test_only_admins_can_update_customers(): void
    {
        $staff = User::factory()->create();
        $staff->assignRole('staff');

        $customer = Customer::factory()->create();

        $this->actingAs($staff)
            ->patch(route('customers.update', $customer), [
                'name' => 'Hacked',
            ])
            ->assertForbidden();

        $this->assertNotSame('Hacked', $customer->refresh()->name);
    }

    public function test_admin_can_update_a_customer(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $customer = Customer::factory()->create();

        $this->actingAs($admin)
            ->patch(route('customers.update', $customer), [
                'name' => 'Updated Name',
                'email' => $customer->email,
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertSame('Updated Name', $customer->refresh()->name);
    }

    public function test_only_admins_can_delete_customers(): void
    {
        $staff = User::factory()->create();
        $staff->assignRole('staff');

        $customer = Customer::factory()->create();

        $this->actingAs($staff)
            ->delete(route('customers.destroy', $customer))
            ->assertForbidden();

        $this->assertDatabaseHas('customers', ['id' => $customer->id]);
    }

    public function test_admin_can_delete_a_customer(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $customer = Customer::factory()->create();

        $this->actingAs($admin)
            ->delete(route('customers.destroy', $customer))
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('customers', ['id' => $customer->id]);
    }

    public function test_customers_can_be_searched_by_name(): void
    {
        $staff = User::factory()->create();
        $staff->assignRole('staff');

        Customer::factory()->create(['name' => 'Unique Searchable Name']);
        Customer::factory()->count(5)->create();

        $this->actingAs($staff)
            ->get('/customers?search=Unique+Searchable')
            ->assertOk();
    }
}
