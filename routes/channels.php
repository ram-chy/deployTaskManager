<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('tasks', function ($user) {
    return $user !== null;
});

Broadcast::channel('App.Models.User.{id}', function ($user, int $id) {
    return (int) $user->id === (int) $id;
});
