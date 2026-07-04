import type {
  AttachmentResponse,
  TaskFormValues,
  TaskListParams,
  TaskResponse,
  TasksListResponse,
} from "../types/task";
import api from "./axios";

export async function fetchTasks(
  params: TaskListParams
): Promise<TasksListResponse> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== "" && value !== undefined && value !== null
    )
  );

  const { data } = await api.get<TasksListResponse>("/tasks", {
    params: cleanParams,
  });
  return data;
}

export async function createTask(
  payload: TaskFormValues
): Promise<TaskResponse> {
  const { data } = await api.post<TaskResponse>("/tasks", payload);
  return data;
}

export async function updateTask(
  id: number,
  payload: TaskFormValues
): Promise<TaskResponse> {
  const { data } = await api.put<TaskResponse>(`/tasks/${id}`, payload);
  return data;
}

export async function deleteTask(id: number): Promise<void> {
  await api.delete(`/tasks/${id}`);
}

export async function uploadTaskAttachment(
  taskId: number,
  file: File
): Promise<AttachmentResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post<AttachmentResponse>(
    `/tasks/${taskId}/attachments`,
    formData
  );
  return data;
}

export async function downloadTaskAttachment(
  taskId: number,
  attachmentId: number,
  originalName: string
): Promise<void> {
  const response = await api.get(
    `/tasks/${taskId}/attachments/${attachmentId}/download`,
    { responseType: "blob" }
  );

  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = originalName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function deleteTaskAttachment(
  taskId: number,
  attachmentId: number
): Promise<void> {
  await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
}
