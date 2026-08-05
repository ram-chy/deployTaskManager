<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
    }

    public function test_registration_screen_can_be_rendered(): void
    {
        $this->get('/register')->assertOk();
    }

    public function test_new_users_can_register(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_registered_users_are_assigned_the_staff_role(): void
    {
        $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $user = User::where('email', 'test@example.com')->firstOrFail();

        $this->assertTrue($user->isStaff());
        $this->assertFalse($user->isAdmin());
        $this->assertFalse($user->isManager());
    }

    public function test_registration_validates_input(): void
    {
        $existing = User::factory()->create();

        $this->post('/register', [
            'name' => '',
            'email' => $existing->email,
            'password' => 'short',
            'password_confirmation' => 'mismatch',
        ])->assertSessionHasErrors(['name', 'email', 'password']);

        $this->assertGuest();
    }
}