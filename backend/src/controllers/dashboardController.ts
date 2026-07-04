import { Op } from "sequelize";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { Task, User } from "../models";

function todayDateOnly(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getDashboardStats(
  req: AuthRequest,
  res: Response
): Promise<void> {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  if (req.user.role === "admin") {
    const [totalEmployees, totalTasks, completedTasks, pendingTasks] =
      await Promise.all([
        User.count({ where: { role: "employee" } }),
        Task.count(),
        Task.count({ where: { status: "completed" } }),
        Task.count({ where: { status: { [Op.ne]: "completed" } } }),
      ]);

    res.status(200).json({
      success: true,
      data: {
        role: "admin",
        totalEmployees,
        totalTasks,
        completedTasks,
        pendingTasks,
      },
    });
    return;
  }

  const employeeId = req.user.id;
  const today = todayDateOnly();

  const [myTasks, completedTasks, pendingTasks, overdueTasks] =
    await Promise.all([
      Task.count({ where: { assignedToId: employeeId } }),
      Task.count({
        where: { assignedToId: employeeId, status: "completed" },
      }),
      Task.count({
        where: {
          assignedToId: employeeId,
          status: { [Op.ne]: "completed" },
        },
      }),
      Task.count({
        where: {
          assignedToId: employeeId,
          status: { [Op.ne]: "completed" },
          dueDate: { [Op.lt]: today },
        },
      }),
    ]);

  res.status(200).json({
    success: true,
    data: {
      role: "employee",
      myTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
    },
  });
}
