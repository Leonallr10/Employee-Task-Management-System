import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { fetchEmployees } from "../api/employees";
import { createTask, deleteTask, fetchTasks, updateTask } from "../api/tasks";
import { useAppSelector } from "../hooks/redux";
import type { Employee } from "../types/employee";
import type { Task, TaskPriority, TaskStatus } from "../types/task";
import { getErrorMessage } from "../utils/errors";

const taskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(200, "Title must be at most 200 characters"),
    description: z.string().max(2000).optional().or(z.literal("")),
    priority: z.enum(["low", "medium", "high"]),
    status: z.enum(["pending", "in_progress", "completed"]),
    startDate: z.string().min(1, "Start date is required"),
    dueDate: z.string().min(1, "Due date is required"),
    assignedToId: z.string().min(1, "Assigned employee is required"),
  })
  .refine((values) => values.dueDate >= values.startDate, {
    message: "Due date must not be earlier than start date",
    path: ["dueDate"],
  });

type TaskFormValues = z.infer<typeof taskSchema>;

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

const labelClass = "block text-sm font-medium text-slate-700";

const priorityStyles: Record<TaskPriority, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-sky-50 text-sky-700",
  high: "bg-rose-50 text-rose-700",
};

const statusStyles: Record<TaskStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  in_progress: "bg-indigo-50 text-indigo-700",
  completed: "bg-emerald-50 text-emerald-700",
};

function formatStatus(status: TaskStatus): string {
  return status.replace("_", " ");
}

export default function TasksPage() {
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === "admin";

  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "pending",
      startDate: "",
      dueDate: "",
      assignedToId: user?.id ? String(user.id) : "",
    },
  });

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchTasks({
        page,
        limit: 8,
        search,
        status: statusFilter,
        priority: priorityFilter,
        sortBy: "dueDate",
        sortOrder: "asc",
      });
      setTasks(response.data.tasks);
      setTotalPages(response.data.pagination.totalPages);
      setTotal(response.data.pagination.total);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load tasks"));
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, priorityFilter]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    async function loadEmployees() {
      try {
        const response = await fetchEmployees({ page: 1, limit: 50 });
        setEmployees(response.data.employees);
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to load employees"));
      }
    }

    void loadEmployees();
  }, [isAdmin]);

  const openCreateModal = () => {
    setEditingTask(null);
    reset({
      title: "",
      description: "",
      priority: "medium",
      status: "pending",
      startDate: "",
      dueDate: "",
      assignedToId: isAdmin
        ? employees[0]
          ? String(employees[0].id)
          : ""
        : user?.id
          ? String(user.id)
          : "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    if (task.status === "completed") {
      toast.error("Completed tasks cannot be edited");
      return;
    }

    setEditingTask(task);
    reset({
      title: task.title,
      description: task.description ?? "",
      priority: task.priority,
      status: task.status,
      startDate: task.startDate,
      dueDate: task.dueDate,
      assignedToId: String(task.assignedToId),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const onSubmit = async (values: TaskFormValues) => {
    const payload = {
      title: values.title,
      description: values.description ?? "",
      priority: values.priority,
      status: values.status,
      startDate: values.startDate,
      dueDate: values.dueDate,
      assignedToId: isAdmin ? Number(values.assignedToId) : user!.id,
    };

    try {
      setSaving(true);
      if (editingTask) {
        await updateTask(editingTask.id, payload);
        toast.success("Task updated successfully");
      } else {
        await createTask(payload);
        toast.success("Task created successfully");
      }
      closeModal();
      await loadTasks();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save task"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (task: Task) => {
    const confirmed = window.confirm(`Delete task "${task.title}"?`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteTask(task.id);
      toast.success("Task deleted successfully");
      if (tasks.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadTasks();
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete task"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Task Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isAdmin
              ? "Create and manage all tasks"
              : "View and update your assigned tasks"}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Add Task
        </button>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search tasks"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 md:col-span-2"
          />
          <select
            value={statusFilter}
            onChange={(event) => {
              setPage(1);
              setStatusFilter(event.target.value as TaskStatus | "");
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(event) => {
              setPage(1);
              setPriorityFilter(event.target.value as TaskPriority | "");
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <p className="mb-3 text-sm text-slate-500">{total} task(s)</p>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Priority</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Start</th>
                <th className="px-4 py-3 font-semibold">Due</th>
                <th className="px-4 py-3 font-semibold">Assignee</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Loading tasks...
                  </td>
                </tr>
              )}

              {!loading && tasks.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No tasks found.
                  </td>
                </tr>
              )}

              {!loading &&
                tasks.map((task) => {
                  const isCompleted = task.status === "completed";
                  return (
                    <tr key={task.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{task.title}</p>
                        {task.description && (
                          <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                            {task.description}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${priorityStyles[task.priority]}`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${statusStyles[task.status]}`}
                        >
                          {formatStatus(task.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{task.startDate}</td>
                      <td className="px-4 py-3 text-slate-600">{task.dueDate}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {task.assignee?.fullName ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isCompleted}
                            onClick={() => openEditModal(task)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(task)}
                            className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingTask ? "Edit Task" : "Add Task"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-sm text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              <div>
                <label htmlFor="title" className={labelClass}>
                  Title
                </label>
                <input id="title" className={inputClass} {...register("title")} />
                {errors.title && (
                  <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className={labelClass}>
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  className={inputClass}
                  {...register("description")}
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="priority" className={labelClass}>
                    Priority
                  </label>
                  <select
                    id="priority"
                    className={inputClass}
                    {...register("priority")}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className={labelClass}>
                    Status
                  </label>
                  <select
                    id="status"
                    className={inputClass}
                    {...register("status")}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="startDate" className={labelClass}>
                    Start Date
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    className={inputClass}
                    {...register("startDate")}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.startDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="dueDate" className={labelClass}>
                    Due Date
                  </label>
                  <input
                    id="dueDate"
                    type="date"
                    className={inputClass}
                    {...register("dueDate")}
                  />
                  {errors.dueDate && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.dueDate.message}
                    </p>
                  )}
                </div>
              </div>

              {isAdmin ? (
                <div>
                  <label htmlFor="assignedToId" className={labelClass}>
                    Assigned Employee
                  </label>
                  <select
                    id="assignedToId"
                    className={inputClass}
                    {...register("assignedToId")}
                  >
                    <option value="">Select employee</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.fullName} ({employee.email})
                      </option>
                    ))}
                  </select>
                  {errors.assignedToId && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.assignedToId.message}
                    </p>
                  )}
                </div>
              ) : (
                <input type="hidden" {...register("assignedToId")} />
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingTask
                      ? "Update Task"
                      : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
