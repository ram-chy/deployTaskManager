<?php

namespace Database\Factories;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Models\Customer;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Task>
 */
class TaskFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(4),
            'description' => fake()->optional(0.7)->paragraph(),
            'status' => fake()->randomElement(TaskStatus::cases()),
            'priority' => fake()->randomElement(TaskPriority::cases()),
            'due_date' => fake()->optional(0.8)->dateTimeBetween('-1 week', '+4 weeks')?->format('Y-m-d'),
            'assignee_id' => null,
            'customer_id' => null,
            'created_by' => null,
        ];
    }

    public function submittedForDesign(): static
    {
        return $this->state(fn (): array => ['status' => TaskStatus::SubmitForDesign]);
    }

    public function sendForApprove(): static
    {
        return $this->state(fn (): array => ['status' => TaskStatus::SendForApprove]);
    }

    public function approved(): static
    {
        return $this->state(fn (): array => ['status' => TaskStatus::Approved]);
    }

    public function sendForPrint(): static
    {
        return $this->state(fn (): array => ['status' => TaskStatus::SendForPrint]);
    }

    public function printCompleted(): static
    {
        return $this->state(fn (): array => ['status' => TaskStatus::PrintComplete]);
    }

    public function assignedTo(User $user): static
    {
        return $this->state(fn (): array => ['assignee_id' => $user->id]);
    }

    public function forCustomer(Customer $customer): static
    {
        return $this->state(fn (): array => ['customer_id' => $customer->id]);
    }
}
