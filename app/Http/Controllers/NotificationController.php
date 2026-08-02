<?php

namespace App\Http\Controllers;

use App\Http\Resources\NotificationResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Return the latest notifications and the unread count.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $notifications = $user
            ->notifications()
            ->limit(10)
            ->get();

        return response()->json([
            'data' => NotificationResource::collection($notifications),
            'unread_count' => $user->unreadNotifications()->count(),
        ]);
    }

    /**
     * Mark all of the user's notifications as read.
     */
    public function read(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications()->update(['read_at' => now()]);

        return response()->json(['unread_count' => 0]);
    }
}
