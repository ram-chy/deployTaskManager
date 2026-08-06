<?php

namespace App\Enums;

enum TaskStatus: string
{
    case SubmitForDesign = 'submit_for_design';
    case SendForApprove = 'send_for_approve';
    case Approved = 'approved';
    case SendForPrint = 'send_for_print';
    case PrintComplete = 'print_complete';

    public function label(): string
    {
        return match ($this) {
            self::SubmitForDesign => 'Submit For Design',
            self::SendForApprove => 'Send for Approve',
            self::Approved => 'Approved',
            self::SendForPrint => 'Send for Print',
            self::PrintComplete => 'Print Complete',
        };
    }

    /**
     * The next status in the workflow, or null when the task is finished.
     */
    public function next(): ?self
    {
        return match ($this) {
            self::SubmitForDesign => self::SendForApprove,
            self::SendForApprove => self::Approved,
            self::Approved => self::SendForPrint,
            self::SendForPrint => self::PrintComplete,
            self::PrintComplete => null,
        };
    }
}
