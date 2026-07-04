export type NotificationType = "assigned" | "due_soon" | "completed";

export interface AppNotification {
  id: number;
  userId: number;
  taskId: number | null;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  task?: {
    id: number;
    title: string;
    status: string;
    dueDate: string;
  } | null;
}

export interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: AppNotification[];
    unreadCount: number;
  };
}
