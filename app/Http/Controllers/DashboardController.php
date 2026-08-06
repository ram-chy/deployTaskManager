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
                'submit_for_design' => $counts[TaskStatus::SubmitForDesign->value] ?? 0,
                'send_for_approve' => $counts[TaskStatus::SendForApprove->value] ?? 0,
                'approved' => $counts[TaskStatus::Approved->value] ?? 0,
                'send_for_print' => $counts[TaskStatus::SendForPrint->value] ?? 0,
                'print_complete' => $counts[TaskStatus::PrintComplete->value] ?? 0,
                'today' => $service->getTodaysTaskCount(),
            ],
            'recentActivities' => TaskResource::collection(
                $service->getRecentActivities(),
            )->resolve($request),
        ]);
    }
}
