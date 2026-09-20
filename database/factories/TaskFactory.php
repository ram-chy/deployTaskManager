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

    public function pending(): static
    {
        return $this->state(fn (): array => ['status' => TaskStatus::Pending]);
    }

    public function inProgress(): static
    {
        return $this->state(fn (): array => ['status' => TaskStatus::InProgress]);
    }

    public function underReview(): static
    {
        return $this->state(fn (): array => ['status' => TaskStatus::UnderReview]);
    }

    public function completed(): static
    {
        return $this->state(fn (): array => ['status' => TaskStatus::Completed]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (): array => ['status' => TaskStatus::Cancelled]);
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
