<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class UserService extends AbstractService
{
    /**
     * Create a user and assign their initial role.
     */
    public function createUser(array $data): User
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
        ]);

        $user->roles()->sync([(int) $data['role_id']]);

        return $user->load('roles');
    }

    /**
     * Update a user's profile and role.
     */
    public function updateUser(User $user, array $data): User
    {
        $user->fill([
            'name' => $data['name'],
            'email' => $data['email'],
        ]);

        if (! empty($data['password'])) {
            $user->password = $data['password'];
        }

        $user->save();
        $user->roles()->sync([(int) $data['role_id']]);

        return $user->load('roles');
    }

    /**
     * Replace a user's assigned roles with the given role ids.
     */
    public function syncRoles(User $user, array|Collection $roleIds): User
    {
        $user->roles()->sync($roleIds);

        return $user->load('roles');
    }

    /**
     * Fetch users with their roles, ordered by creation date.
     */
    public function listUsers(): LengthAwarePaginator
    {
        return User::query()
            ->with('roles')
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString();
    }
}
