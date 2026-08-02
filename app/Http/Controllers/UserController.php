<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRoleRequest;
use App\Http\Resources\RoleResource;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(UserService $service): Response
    {
        return Inertia::render('Users/Index', [
            'users' => UserResource::collection($service->listUsers())->response()->getData(true),
            'roles' => RoleResource::collection(Role::orderBy('name')->get())->resolve(),
        ]);
    }

    public function store(StoreUserRequest $request, UserService $service): RedirectResponse
    {
        $service->createUser($request->validated());

        return back()->with('success', 'User created.');
    }

    public function updateRole(UpdateUserRoleRequest $request, UserService $service, User $user): RedirectResponse
    {
        $service->syncRoles($user, [$request->integer('role_id')]);

        return back()->with('success', sprintf('Role updated for %s.', $user->name));
    }
}
