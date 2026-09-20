<?php

namespace App\Http\Controllers;

use App\Enums\TaskStatus;
use App\Http\Resources\TaskResource;
use App\Services\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request, DashboardService $service): Response
    {
        $counts = $service->getStatusCounts();

        return Inertia::render('Dashboard', [
            'stats' => [
                'pending' => $counts[TaskStatus::Pending->value] ?? 0,
                'in_progress' => $counts[TaskStatus::InProgress->value] ?? 0,
                'under_review' => $counts[TaskStatus::UnderReview->value] ?? 0,
                'completed' => $counts[TaskStatus::Completed->value] ?? 0,
                'cancelled' => $counts[TaskStatus::Cancelled->value] ?? 0,
                'today' => $service->getTodaysTaskCount(),
            ],
            'recentActivities' => TaskResource::collection(
                $service->getRecentActivities(),
            )->resolve($request),
        ]);
    }
}
