import type {
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
