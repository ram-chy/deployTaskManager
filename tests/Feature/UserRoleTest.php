<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserRoleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
    }

    public function test_users_index_is_visible_to_admins(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $this->actingAs($admin)
            ->get('/users')
            ->assertOk();
    }

    public function test_users_index_passes_roles_as_a_plain_array(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $this->actingAs($admin)
            ->get('/users')
            ->assertOk()
            ->assertInertia(function ($page) {
                $roles = $page->toArray()['props']['roles'];

                $this->assertIsArray($roles);
                $this->assertArrayHasKey(0, $roles);
                $this->assertSame('Admin', $roles[0]['name']);
            });
    }

    public function test_users_index_is_forbidden_for_non_admins(): void
    {
        $manager = User::factory()->create();
        $manager->assignRole('manager');

        $this->actingAs($manager)
            ->get('/users')
            ->assertForbidden();
    }

    public function test_users_index_requires_authentication(): void
    {
        $this->get('/users')->assertRedirect('/login');
    }

    public function test_admin_can_create_a_user(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $this->actingAs($admin)
            ->post(route('users.store'), [
                'name' => 'New Staff Member',
                'email' => 'new@taskmanager.local',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'role_id' => Role::where('slug', 'staff')->value('id'),
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $user = User::where('email', 'new@taskmanager.local')->firstOrFail();

        $this->assertNotSame('password123', $user->password);
        $this->assertTrue($user->isStaff());
    }

    public function test_non_admins_cannot_create_users(): void
    {
        $manager = User::factory()->create();
        $manager->assignRole('manager');

        $this->actingAs($manager)
            ->post(route('users.store'), [
                'name' => 'Hacker',
                'email' => 'hacker@taskmanager.local',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'role_id' => Role::where('slug', 'staff')->value('id'),
            ])
            ->assertForbidden();

        $this->assertDatabaseMissing('users', ['email' => 'hacker@taskmanager.local']);
    }

    public function test_user_creation_validates_input(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $existing = User::factory()->create();

        $this->actingAs($admin)
            ->post(route('users.store'), [
                'name' => '',
                'email' => $existing->email,
                'password' => 'short',
                'password_confirmation' => 'mismatch',
                'role_id' => 999,
            ])
            ->assertSessionHasErrors(['name', 'email', 'password', 'role_id']);
    }

    public function test_admin_can_update_a_user(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $target = User::factory()->create();
        $target->assignRole('staff');

        $this->actingAs($admin)
            ->patch(route('users.update', $target), [
                'name' => 'Updated Name',
                'email' => 'updated@taskmanager.local',
                'password' => 'newpassword123',
                'password_confirmation' => 'newpassword123',
                'role_id' => Role::where('slug', 'manager')->value('id'),
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $target->refresh();

        $this->assertSame('Updated Name', $target->name);
        $this->assertSame('updated@taskmanager.local', $target->email);
        $this->assertNotSame('newpassword123', $target->password);
        $this->assertTrue($target->isManager());
    }

    public function test_admin_can_update_a_user_without_changing_password(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $target = User::factory()->create(['password' => 'originalpass123']);
        $target->assignRole('staff');

        $this->actingAs($admin)
            ->patch(route('users.update', $target), [
                'name' => 'Kept Password',
                'email' => $target->email,
                'password' => '',
                'password_confirmation' => '',
                'role_id' => Role::where('slug', 'staff')->value('id'),
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $target->refresh();

        $this->assertSame('Kept Password', $target->name);
        $this->assertTrue(password_verify('originalpass123', $target->password));
    }

    public function test_non_admins_cannot_update_users(): void
    {
        $manager = User::factory()->create();
        $manager->assignRole('manager');

        $target = User::factory()->create();

        $this->actingAs($manager)
            ->patch(route('users.update', $target), [
                'name' => 'Hacker',
                'email' => 'hacker@taskmanager.local',
                'password' => '',
                'password_confirmation' => '',
                'role_id' => Role::where('slug', 'staff')->value('id'),
            ])
            ->assertForbidden();

        $this->assertDatabaseHas('users', [
            'id' => $target->id,
            'name' => $target->name,
            'email' => $target->email,
        ]);
    }

    public function test_user_update_validates_input(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $target = User::factory()->create();
        $other = User::factory()->create();
        $originalEmail = $target->email;

        $this->actingAs($admin)
            ->from('/users')
            ->patch(route('users.update', $target), [
                'name' => '',
                'email' => $other->email,
                'password' => 'short',
                'password_confirmation' => 'mismatch',
                'role_id' => 999,
            ])
            ->assertSessionHasErrors(['name', 'email', 'password', 'role_id']);

        $this->assertSame($originalEmail, $target->refresh()->email);
    }

    public function test_admin_can_update_a_users_role(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $target = User::factory()->create();

        $this->actingAs($admin)
            ->patch(route('users.role.update', $target), [
                'role_id' => Role::where('slug', 'manager')->value('id'),
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertTrue($target->refresh()->isManager());
    }

    public function test_role_update_requires_a_valid_role(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $target = User::factory()->create();

        $this->actingAs($admin)
            ->from('/users')
            ->patch(route('users.role.update', $target), [
                'role_id' => 999,
            ])
            ->assertSessionHasErrors('role_id');

        $this->assertEmpty($target->refresh()->roles);
    }

    public function test_roles_can_be_assigned_checked_and_removed(): void
    {
        $user = User::factory()->create();

        $user->assignRole('admin');
        $this->assertTrue($user->isAdmin());

        $user->assignRole('manager');
        $this->assertTrue($user->hasRole('manager'));

        $user->syncRoles('staff');
        $this->assertTrue($user->isStaff());
        $this->assertFalse($user->isAdmin());

        $user->removeRole('staff');
        $this->assertFalse($user->isStaff());
        $this->assertEmpty($user->refresh()->roles);
    }

    public function test_has_role_accepts_multiple_role_slugs(): void
    {
        $user = User::factory()->create();
        $user->assignRole('admin');

        $this->assertTrue($user->hasRole(['manager', 'admin']));
        $this->assertFalse($user->hasRole(['manager', 'staff']));
    }
}
