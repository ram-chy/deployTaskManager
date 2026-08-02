<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Collection;

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class)->withTimestamps();
    }

    public function hasRole(string|array $roles): bool
    {
        return $this->roles()->whereIn('slug', (array) $roles)->exists();
    }

    public function assignRole(Role|string $role): void
    {
        $roleId = $role instanceof Role ? $role->id : $this->resolveRoleId($role);

        $this->roles()->syncWithoutDetaching([$roleId]);
    }

    public function syncRoles(Role|string|array|Collection $roles): void
    {
        $this->roles()->sync($this->resolveRoleIds($roles));
    }

    public function removeRole(Role|string $role): void
    {
        $roleId = $role instanceof Role ? $role->id : $this->resolveRoleId($role);

        $this->roles()->detach($roleId);
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    public function isManager(): bool
    {
        return $this->hasRole('manager');
    }

    public function isStaff(): bool
    {
        return $this->hasRole('staff');
    }

    private function resolveRoleId(string $slug): int
    {
        return Role::where('slug', $slug)->valueOrFail('id');
    }

    private function resolveRoleIds(Role|string|array|Collection $roles): array
    {
        return collect($roles)
            ->map(fn (Role|string $role) => $role instanceof Role
                ? $role->id
                : $this->resolveRoleId($role))
            ->values()
            ->all();
    }
}
