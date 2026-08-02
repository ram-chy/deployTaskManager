import { usePage } from '@inertiajs/react';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';
import { useToast } from '@/components/toast/ToastProvider';
import type { AppNotification } from '@/types';

interface NotificationContextValue {
    unreadCount: number;
    items: AppNotification[];
    refresh: () => Promise<void>;
    markAllRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(
    null,
);

const statusLabel: Record<string, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
};

export default function NotificationProvider({
    children,
}: {
    children: ReactNode;
}) {
    const user = usePage().props.auth.user;
    const initialUnread = usePage().props.notifications.unread_count;
    const { info } = useToast();

    const [unreadCount, setUnreadCount] = useState(initialUnread);
    const [items, setItems] = useState<AppNotification[]>([]);

    const refresh = useCallback(async () => {
        try {
            const { data } = await window.axios.get<{
                data: AppNotification[];
                unread_count: number;
            }>(route('notifications.index'));

            setItems(data.data);
            setUnreadCount(data.unread_count);
        } catch {
            // ignore transient fetch errors
        }
    }, []);

    const markAllRead = useCallback(async () => {
        setUnreadCount(0);
        setItems((current) =>
            current.map((item) => ({
                ...item,
                read_at: new Date().toISOString(),
            })),
        );

        try {
            await window.axios.post(route('notifications.read'));
        } catch {
            // ignore transient errors
        }
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    useEffect(() => {
        if (!window.Echo) {
            return;
        }

        const tasks = window.Echo.private('tasks');

        const onTaskCreated = (payload: { title?: string }) => {
            info(`New task created: ${payload.title ?? 'Untitled'}`);
            void refresh();
        };

        const onTaskStatusUpdated = (payload: {
            title?: string;
            new_status?: string;
        }) => {
            const status =
                statusLabel[payload.new_status ?? ''] ?? payload.new_status;
            info(`Task "${payload.title ?? ''}" is now ${status}`);
            void refresh();
        };

        tasks.listen('TaskCreated', onTaskCreated);
        tasks.listen('TaskStatusUpdated', onTaskStatusUpdated);

        const mine = window.Echo.private(`App.Models.User.${user.id}`);

        const onNotification = (notification: { message?: string }) => {
            info(notification.message ?? 'You have a new notification');
            void refresh();
        };

        mine.notification(onNotification);

        return () => {
            tasks.stopListening('TaskCreated', onTaskCreated);
            tasks.stopListening('TaskStatusUpdated', onTaskStatusUpdated);

            mine.stopListening(
                'Illuminate\\Notifications\\Events\\BroadcastNotificationCreated',
            );

            window.Echo.leaveChannel('private-tasks');
            window.Echo.leaveChannel(`private-App.Models.User.${user.id}`);
        };
    }, [info, refresh, user.id]);

    return (
        <NotificationContext.Provider
            value={{ unreadCount, items, refresh, markAllRead }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotification(): NotificationContextValue {
    const context = useContext(NotificationContext);

    if (!context) {
        throw new Error(
            'useNotification must be used within a NotificationProvider',
        );
    }

    return context;
}
