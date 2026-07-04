import ExcelJS from "exceljs";
import { Op, type WhereOptions } from "sequelize";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { Task, User } from "../models";

type ReportType = "completed" | "pending" | "employee";
type ReportFormat = "json" | "csv" | "xlsx";

interface ReportRow {
  taskId: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  startDate: string;
  dueDate: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  designation: string;
}

const REPORT_HEADERS = [
  "Task ID",
  "Title",
  "Description",
  "Priority",
  "Status",
  "Start Date",
  "Due Date",
  "Employee Name",
  "Employee Email",
  "Department",
  "Designation",
] as const;

function toRow(task: Task): ReportRow {
  return {
    taskId: task.id,
    title: task.title,
    description: task.description ?? "",
    priority: task.priority,
    status: task.status,
    startDate: String(task.startDate),
    dueDate: String(task.dueDate),
    employeeName: task.assignee?.fullName ?? "",
    employeeEmail: task.assignee?.email ?? "",
    department: task.assignee?.department ?? "",
    designation: task.assignee?.designation ?? "",
  };
}

function rowToArray(row: ReportRow): (string | number)[] {
  return [
    row.taskId,
    row.title,
    row.description,
    row.priority,
    row.status,
    row.startDate,
    row.dueDate,
    row.employeeName,
    row.employeeEmail,
    row.department,
    row.designation,
  ];
}

function escapeCsv(value: string | number): string {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function buildCsv(rows: ReportRow[]): string {
  const lines = [
    REPORT_HEADERS.join(","),
    ...rows.map((row) => rowToArray(row).map(escapeCsv).join(",")),
  ];
  return lines.join("\n");
}

async function buildExcel(rows: ReportRow[], sheetName: string): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);
  sheet.addRow([...REPORT_HEADERS]);
  sheet.getRow(1).font = { bold: true };

  rows.forEach((row) => {
    sheet.addRow(rowToArray(row));
  });

  sheet.columns.forEach((column) => {
    column.width = 18;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

async function getReportRows(
  req: AuthRequest,
  type: ReportType
): Promise<ReportRow[]> {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  if (type === "employee" && req.user.role !== "admin") {
    throw new AppError("Only admins can view employee-wise reports", 403);
  }

  const where: WhereOptions = {};

  if (req.user.role !== "admin") {
    where.assignedToId = req.user.id;
  }

  if (type === "completed") {
    where.status = "completed";
  } else if (type === "pending") {
    where.status = { [Op.ne]: "completed" };
  }

  const tasks = await Task.findAll({
    where,
    include: [
      {
        model: User,
        as: "assignee",
        attributes: [
          "id",
          "fullName",
          "email",
          "department",
          "designation",
        ],
      },
    ],
    order:
      type === "employee"
        ? [
            [{ model: User, as: "assignee" }, "fullName", "ASC"],
            ["dueDate", "ASC"],
          ]
        : [["dueDate", "ASC"]],
  });

  return tasks.map(toRow);
}

export async function getReports(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const type = req.query.type as ReportType | undefined;
  const format = (req.query.format as ReportFormat | undefined) ?? "json";

  if (!type || !["completed", "pending", "employee"].includes(type)) {
    throw new AppError(
      "Report type must be completed, pending, or employee",
      400
    );
  }

  if (!["json", "csv", "xlsx"].includes(format)) {
    throw new AppError("Format must be json, csv, or xlsx", 400);
  }

  const rows = await getReportRows(req, type);
  const reportTitles: Record<ReportType, string> = {
    completed: "Completed Tasks Report",
    pending: "Pending Tasks Report",
    employee: "Employee-wise Task Report",
  };

  if (format === "json") {
    res.status(200).json({
      success: true,
      data: {
        type,
        title: reportTitles[type],
        total: rows.length,
        rows,
      },
    });
    return;
  }

  const filenameBase = `${type}-tasks-report`;

  if (format === "csv") {
    const csv = buildCsv(rows);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filenameBase}.csv"`
    );
    res.status(200).send(csv);
    return;
  }

  const excel = await buildExcel(rows, reportTitles[type]);
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filenameBase}.xlsx"`
  );
  res.status(200).send(excel);
}
