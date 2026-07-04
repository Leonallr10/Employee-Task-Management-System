import { Op, UniqueConstraintError, type WhereOptions } from "sequelize";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { Task, User } from "../models";
import { hashPassword } from "../utils/password";

const SORTABLE_FIELDS = [
  "fullName",
  "email",
  "department",
  "designation",
  "createdAt",
] as const;

type SortField = (typeof SORTABLE_FIELDS)[number];

function parsePositiveInt(value: unknown, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.floor(parsed);
}

export async function listEmployees(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const page = parsePositiveInt(req.query.page, 1);
  const limit = Math.min(parsePositiveInt(req.query.limit, 10), 50);
  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : "";
  const sortBy = (
    SORTABLE_FIELDS.includes(req.query.sortBy as SortField)
      ? req.query.sortBy
      : "createdAt"
  ) as SortField;
  const sortOrder =
    req.query.sortOrder === "asc" || req.query.sortOrder === "desc"
      ? req.query.sortOrder
      : "desc";

  const where: WhereOptions = {
    role: "employee",
    ...(search
      ? {
          [Op.or]: [
            { fullName: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { department: { [Op.like]: `%${search}%` } },
            { designation: { [Op.like]: `%${search}%` } },
          ],
        }
      : {}),
  };

  const offset = (page - 1) * limit;

  const { rows, count } = await User.findAndCountAll({
    where,
    order: [[sortBy, sortOrder.toUpperCase()]],
    limit,
    offset,
  });

  res.status(200).json({
    success: true,
    data: {
      employees: rows.map((employee) => employee.toEmployeeJSON()),
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.max(1, Math.ceil(count / limit)),
      },
      sort: {
        sortBy,
        sortOrder,
      },
      search,
    },
  });
}

export async function getEmployee(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const employee = await User.findOne({
    where: { id: req.params.id, role: "employee" },
  });

  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  res.status(200).json({
    success: true,
    data: { employee: employee.toEmployeeJSON() },
  });
}

export async function createEmployee(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { fullName, email, department, designation, password } = req.body as {
    fullName: string;
    email: string;
    department: string;
    designation: string;
    password: string;
  };

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  try {
    const employee = await User.create({
      fullName,
      email,
      department,
      designation,
      password: await hashPassword(password),
      role: "employee",
    });

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: { employee: employee.toEmployeeJSON() },
    });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new AppError("Email is already registered", 409);
    }
    throw error;
  }
}

export async function updateEmployee(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const employee = await User.findOne({
    where: { id: req.params.id, role: "employee" },
  });

  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  const { fullName, email, department, designation, password } = req.body as {
    fullName: string;
    email: string;
    department: string;
    designation: string;
    password?: string;
  };

  if (email !== employee.email) {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError("Email is already registered", 409);
    }
  }

  employee.fullName = fullName;
  employee.email = email;
  employee.department = department;
  employee.designation = designation;

  if (password) {
    employee.password = await hashPassword(password);
  }

  try {
    await employee.save();
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new AppError("Email is already registered", 409);
    }
    throw error;
  }

  res.status(200).json({
    success: true,
    message: "Employee updated successfully",
    data: { employee: employee.toEmployeeJSON() },
  });
}

export async function deleteEmployee(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const employee = await User.findOne({
    where: { id: req.params.id, role: "employee" },
  });

  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  await Task.destroy({
    where: {
      [Op.or]: [{ assignedToId: employee.id }, { createdById: employee.id }],
    },
  });
  await employee.destroy();

  res.status(200).json({
    success: true,
    message: "Employee deleted successfully",
  });
}
