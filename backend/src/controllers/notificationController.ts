import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { Notification, Task } from "../models";
import { ensureDueSoonNotifications } from "../services/notificationService";

export async function listNotifications(
  req: AuthRequest,
  res: Response
): Promise<void> {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  await ensureDueSoonNotifications(req.user.id);

  const notifications = await Notification.findAll({
    where: { userId: req.user.id },
    include: [
      {
        model: Task,
        as: "task",
        attributes: ["id", "title", "status", "dueDate"],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit: 50,
  });

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  res.status(200).json({
    success: true,
    data: {
      notifications: notifications.map((item) => item.toJSON()),
      unreadCount,
    },
  });
}

export async function markNotificationRead(
  req: AuthRequest,
  res: Response
): Promise<void> {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const notification = await Notification.findOne({
    where: { id: req.params.id, userId: req.user.id },
  });

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
    data: { notification: notification.toJSON() },
  });
}

export async function markAllNotificationsRead(
  req: AuthRequest,
  res: Response
): Promise<void> {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  await Notification.update(
    { isRead: true },
    { where: { userId: req.user.id, isRead: false } }
  );

  res.status(200).json({
    success: true,
    message: "All notifications marked as read",
  });
}
