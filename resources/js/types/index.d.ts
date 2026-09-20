export interface Role {
    id: number;
    name: string;
    slug: string;
    description?: string;
}

export interface Customer {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export type TaskStatus =
    | 'pending'
    | 'in_progress'
    | 'under_review'
    | 'completed'
    | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskReference {
    id: number;
    name: string;
}

export interface TaskCustomer extends TaskReference {
    email: string | null;
    phone: string | null;
    notes: string | null;
}

export interface Task {
    id: number;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    due_date: string | null;
    is_overdue: boolean;
    assignee_id: number | null;
    assignee: TaskReference | null;
    customer_id: number | null;
    customer: TaskCustomer | null;
    creator: TaskReference | null;
    created_at: string;
    updated_at: string;
    can_transition: boolean;
    can_edit: boolean;
    can_delete: boolean;
}

export interface DashboardStats {
    pending: number;
    in_progress: number;
    under_review: number;
    completed: number;
    cancelled: number;
    today: number;
}

export interface AppNotification {
    id: string;
    task_id: number | null;
    title: string | null;
    message: string;
    read_at: string | null;
    created_at: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    roles: Role[];
}

export interface Flash {
    success?: string;
    error?: string;
    info?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    flash: Flash;
    notifications: {
        unread_count: number;
    };
};
