<?php

namespace Tests\Feature;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Models\Task;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Tests\TestCase;

class ExportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
    }

    public function test_guest_cannot_download_exports(): void
    {
        $this->get(route('tasks.export.pdf'))->assertRedirect(route('login'));
        $this->get(route('tasks.export.excel'))->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_download_pdf_report(): void
    {
        $staff = User::factory()->create();
        $staff->assignRole('staff');
        Task::factory()->create(['title' => 'PDF visible task']);

        $response = $this->actingAs($staff)->get(route('tasks.export.pdf'));

        $response->assertOk()
            ->assertHeader('content-type', 'application/pdf')
            ->assertDownload('tasks-'.now()->format('Y-m-d').'.pdf');

        $this->assertStringStartsWith('%PDF', $this->responseContent($response));
    }

    public function test_authenticated_user_can_download_excel_report(): void
    {
        $staff = User::factory()->create();
        $staff->assignRole('staff');
        Task::factory()->create([
            'title' => 'Excel visible task',
            'description' => 'Excel visible description',
        ]);

        $response = $this->actingAs($staff)->get(route('tasks.export.excel'));

        $response->assertOk()
            ->assertHeader(
                'content-type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            )
            ->assertDownload('tasks-'.now()->format('Y-m-d').'.xlsx');

        $rows = $this->spreadsheetRows($response->streamedContent());

        $this->assertSame(['SL', 'Date', 'Customer', 'Description', 'Status', 'Assigned To', 'Assigned By'], $rows[0]);
        $this->assertContains('Excel visible description', array_column($rows, 3));
    }

    public function test_excel_export_respects_status_filter(): void
    {
        $staff = User::factory()->create();
        $staff->assignRole('staff');
        Task::factory()->create([
            'title' => 'Pending only task',
            'description' => 'Pending only description',
            'status' => TaskStatus::Pending,
        ]);
        Task::factory()->create([
            'title' => 'Completed hidden task',
            'description' => 'Completed hidden description',
            'status' => TaskStatus::Completed,
        ]);

        $response = $this->actingAs($staff)->get(route('tasks.export.excel', [
            'status' => TaskStatus::Pending->value,
        ]));

        $descriptions = array_column($this->spreadsheetRows($response->streamedContent()), 3);

        $this->assertContains('Pending only description', $descriptions);
        $this->assertNotContains('Completed hidden description', $descriptions);
    }

    public function test_excel_export_includes_status_label(): void
    {
        $staff = User::factory()->create();
        $staff->assignRole('staff');
        Task::factory()->create([
            'title' => 'Label check task',
            'description' => 'Label check description',
            'status' => TaskStatus::InProgress,
            'priority' => TaskPriority::High,
        ]);

        $response = $this->actingAs($staff)->get(route('tasks.export.excel'));

        $rows = $this->spreadsheetRows($response->streamedContent());
        $row = collect($rows)->first(fn (array $row): bool => $row[3] === 'Label check description');

        $this->assertNotNull($row);
        $this->assertSame('In Progress', $row[4]);
    }

    public function test_excel_export_respects_created_date_range(): void
    {
        $staff = User::factory()->create();
        $staff->assignRole('staff');
        Task::factory()->create([
            'title' => 'Inside range task',
            'description' => 'Inside range description',
            'created_at' => now()->subDays(2),
        ]);
        Task::factory()->create([
            'title' => 'Outside range task',
            'description' => 'Outside range description',
            'created_at' => now()->subDays(30),
        ]);

        $response = $this->actingAs($staff)->get(route('tasks.export.excel', [
            'from' => now()->subWeek()->toDateString(),
            'to' => now()->toDateString(),
        ]));

        $descriptions = array_column($this->spreadsheetRows($response->streamedContent()), 3);

        $this->assertContains('Inside range description', $descriptions);
        $this->assertNotContains('Outside range description', $descriptions);
    }

    public function test_pdf_view_renders_task_rows_with_labels(): void
    {
        $task = Task::factory()->create([
            'title' => 'Blade row task',
            'description' => 'Blade row description',
        ]);

        $html = view('exports.tasks', ['tasks' => collect([$task])])->render();

        $this->assertStringContainsString('Blade row description', $html);
        $this->assertStringContainsString($task->status->label(), $html);
    }

    private function spreadsheetRows(string $content): array
    {
        $path = tempnam(sys_get_temp_dir(), 'taskmanager-export');

        try {
            file_put_contents($path, $content);

            return IOFactory::load($path)->getActiveSheet()->toArray();
        } finally {
            @unlink($path);
        }
    }

    private function responseContent(TestResponse $response): string
    {
        if ($response->baseResponse instanceof StreamedResponse) {
            return $response->streamedContent();
        }

        return $response->getContent();
    }
}
