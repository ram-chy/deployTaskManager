<?php

use App\Enums\TaskStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Map the old workflow statuses onto the new ones and update the column default.
     */
    public function up(): void
    {
        DB::table('tasks')->where('status', 'pending')->update([
            'status' => TaskStatus::SubmitForDesign->value,
        ]);
        DB::table('tasks')->where('status', 'in_progress')->update([
            'status' => TaskStatus::SendForApprove->value,
        ]);
        DB::table('tasks')->where('status', 'completed')->update([
            'status' => TaskStatus::PrintComplete->value,
        ]);

        Schema::table('tasks', function (Blueprint $table) {
            $table->string('status')->default(TaskStatus::SubmitForDesign->value)->change();
        });
    }

    public function down(): void
    {
        DB::table('tasks')->where('status', TaskStatus::SubmitForDesign->value)->update([
            'status' => 'pending',
        ]);
        DB::table('tasks')->where('status', TaskStatus::SendForApprove->value)->update([
            'status' => 'in_progress',
        ]);
        DB::table('tasks')->where('status', TaskStatus::PrintComplete->value)->update([
            'status' => 'completed',
        ]);

        Schema::table('tasks', function (Blueprint $table) {
            $table->string('status')->default('pending')->change();
        });
    }
};
