import { Op, type WhereOptions } from "sequelize";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { Task, User } from "../models";
import type { TaskPriority, TaskStatus } from "../models";
import {
  notifyTaskAssigned,
  notifyTaskCompleted,
} from "../services/notificationService";

const SORTABLE_FIELDS = [
  "title",
  "priority",
  "status",
  "startDate",
  "dueDate",
  "createdAt",
] as const;

type SortField = (typeof SORTABLE_FIELDS)[number];

const taskInclude = [
  {
    model: User,
    as: "assignee",
    attributes: ["id", "fullName", "email", "department", "designation"],
  },
  {
    model: User,
    as: "creator",
    attributes: ["id", "fullName", "email"],
  },
];

function parsePositiveInt(value: unknown, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.floor(parsed);
}

function assertCanAccessTask(req: AuthRequest, task: Task): void {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  if (req.user.role !== "admin" && task.assignedToId !== req.user.id) {
    throw new AppError("You do not have access to this task", 403);
  }
}

async function assertValidAssignee(assignedToId: number): Promise<User> {
  const employee = await User.findOne({
    where: { id: assignedToId, role: "employee" },
  });

  if (!employee) {
    throw new AppError("Assigned employee not found", 400);
  }

  return employee;
}

async function findTaskOrFail(id: string | number): Promise<Task> {
  const task = await Task.findByPk(id, { include: taskInclude });
  if (!task) {
    throw new AppError("Task not found", 404);
  }
  return task;
}

export async function listTasks(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const page = parsePositiveInt(req.query.page, 1);
  const limit = Math.min(parsePositiveInt(req.query.limit, 10), 50);
  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : "";
  const status =
    typeof req.query.status === "string" ? req.query.status : undefined;
  const priority =
    typeof req.query.priority === "string" ? req.query.priority : undefined;
  const sortBy = (
    SORTABLE_FIELDS.includes(req.query.sortBy as SortField)
      ? req.query.sortBy
      : "createdAt"
  ) as SortField;
  const sortOrder =
    req.query.sortOrder === "asc" || req.query.sortOrder === "desc"
      ? req.query.sortOrder
      : "desc";

  const where: WhereOptions = {};

  if (req.user.role !== "admin") {
    where.assignedToId = req.user.id;
  }

  if (status) {
    where.status = status;
  }

  if (priority) {
    where.priority = priority;
  }

  if (search) {
    Object.assign(where, {
      [Op.or]: [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ],
    });
  }

  const offset = (page - 1) * limit;

  const { rows, count } = await Task.findAndCountAll({
    where,
    include: taskInclude,
    order: [[sortBy, sortOrder.toUpperCase()]],
    limit,
    offset,
    distinct: true,
  });

  res.status(200).json({
    success: true,
    data: {
      tasks: rows.map((task) => task.toJSON()),
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.max(1, Math.ceil(count / limit)),
      },
      sort: { sortBy, sortOrder },
      filters: { search, status: status ?? null, priority: priority ?? null },
    },
  });
}

export async function getTask(req: AuthRequest, res: Response): Promise<void> {
  const task = await findTaskOrFail(req.params.id as string);
  assertCanAccessTask(req, task);

  res.status(200).json({
    success: true,
    data: { task: task.toJSON() },
  });
}

export async function createTask(
  req: AuthRequest,
  res: Response
): Promise<void> {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const {
    title,
    description,
    priority,
    status,
    startDate,
    dueDate,
    assignedToId,
  } = req.body as {
    title: string;
    description?: string;
    priority: TaskPriority;
    status: TaskStatus;
    startDate: string;
    dueDate: string;
    assignedToId: number;
  };

  if (req.user.role !== "admin" && assignedToId !== req.user.id) {
    throw new AppError("Employees can only create tasks for themselves", 403);
  }

  await assertValidAssignee(assignedToId);

  const task = await Task.create({
    title,
    description: description || null,
    priority,
    status,
    startDate,
    dueDate,
    assignedToId,
    createdById: req.user.id,
  });

  await notifyTaskAssigned(task, assignedToId);

  if (status === "completed") {
    await notifyTaskCompleted(task);
  }

  const created = await findTaskOrFail(task.id);

  res.status(201).json({
    success: true,
    message: "Task created successfully",
    data: { task: created.toJSON() },
  });
}

export async function updateTask(
  req: AuthRequest,
  res: Response
): Promise<void> {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const task = await findTaskOrFail(req.params.id as string);
  assertCanAccessTask(req, task);

  if (task.status === "completed") {
    throw new AppError("Completed tasks cannot be edited", 400);
  }

  const {
    title,
    description,
    priority,
    status,
    startDate,
    dueDate,
    assignedToId,
  } = req.body as {
    title: string;
    description?: string;
    priority: TaskPriority;
    status: TaskStatus;
    startDate: string;
    dueDate: string;
    assignedToId: number;
  };

  if (req.user.role !== "admin" && assignedToId !== req.user.id) {
    throw new AppError("Employees can only keep tasks assigned to themselves", 403);
  }

  await assertValidAssignee(assignedToId);

  const previousAssigneeId = task.assignedToId;

  task.title = title;
  task.description = description || null;
  task.priority = priority;
  task.status = status;
  task.startDate = startDate;
  task.dueDate = dueDate;
  task.assignedToId = assignedToId;

  await task.save();

  if (assignedToId !== previousAssigneeId) {
    await notifyTaskAssigned(task, assignedToId);
  }

  if (status === "completed") {
    await notifyTaskCompleted(task);
  }

  const updated = await findTaskOrFail(task.id);

  res.status(200).json({
    success: true,
    message: "Task updated successfully",
    data: { task: updated.toJSON() },
  });
}

export async function deleteTask(
  req: AuthRequest,
  res: Response
): Promise<void> {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const task = await findTaskOrFail(req.params.id as string);
  assertCanAccessTask(req, task);

  if (req.user.role !== "admin" && task.assignedToId !== req.user.id) {
    throw new AppError("You do not have permission to delete this task", 403);
  }

  await task.destroy();

  res.status(200).json({
    success: true,
    message: "Task deleted successfully",
  });
}
