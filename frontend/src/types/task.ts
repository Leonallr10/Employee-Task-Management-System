export type TaskStatus = "pending" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export interface TaskAssignee {
  id: number;
  fullName: string;
  email: string;
  department?: string | null;
  designation?: string | null;
}

export interface TaskAttachment {
  id: number;
  taskId: number;
  uploadedById: number;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  startDate: string;
  dueDate: string;
  assignedToId: number;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  assignee?: TaskAssignee;
  creator?: {
    id: number;
    fullName: string;
    email: string;
  };
  attachments?: TaskAttachment[];
}

export interface TaskFormValues {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  startDate: string;
  dueDate: string;
  assignedToId: number;
}

export interface TasksListResponse {
  success: boolean;
  data: {
    tasks: Task[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface TaskResponse {
  success: boolean;
  message?: string;
  data: {
    task: Task;
  };
}

export interface AttachmentResponse {
  success: boolean;
  message?: string;
  data: {
    attachment: TaskAttachment;
  };
}

export interface TaskListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: TaskStatus | "";
  priority?: TaskPriority | "";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
