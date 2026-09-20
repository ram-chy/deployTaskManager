<?php

use App\Enums\TaskStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Map the previous (print-sector) workflow statuses onto the general-purpose
     * workflow and update the column default.
     */
    public function up(): void
    {
        DB::table('tasks')->where('status', 'submit_for_design')->update([
            'status' => TaskStatus::Pending->value,
        ]);
        DB::table('tasks')->where('status', 'send_for_approve')->update([
            'status' => TaskStatus::InProgress->value,
        ]);
        DB::table('tasks')->where('status', 'approved')->update([
            'status' => TaskStatus::UnderReview->value,
        ]);
        DB::table('tasks')->where('status', 'send_for_print')->update([
            'status' => TaskStatus::UnderReview->value,
        ]);
        DB::table('tasks')->where('status', 'print_complete')->update([
            'status' => TaskStatus::Completed->value,
        ]);

        Schema::table('tasks', function (Blueprint $table) {
            $table->string('status')->default(TaskStatus::Pending->value)->change();
        });
    }

    public function down(): void
    {
        DB::table('tasks')->where('status', TaskStatus::Pending->value)->update([
            'status' => 'submit_for_design',
        ]);
        DB::table('tasks')->where('status', TaskStatus::InProgress->value)->update([
            'status' => 'send_for_approve',
        ]);
        DB::table('tasks')->where('status', TaskStatus::UnderReview->value)->update([
            'status' => 'approved',
        ]);
        DB::table('tasks')->where('status', TaskStatus::Completed->value)->update([
            'status' => 'print_complete',
        ]);
        DB::table('tasks')->where('status', TaskStatus::Cancelled->value)->update([
            'status' => 'approved',
        ]);

        Schema::table('tasks', function (Blueprint $table) {
            $table->string('status')->default('submit_for_design')->change();
        });
    }
};
