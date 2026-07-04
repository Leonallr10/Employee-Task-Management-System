import { Op } from "sequelize";
import { Notification, Task } from "../models";
import type { NotificationType } from "../models";

async function createNotification(input: {
  userId: number;
  taskId: number;
  type: NotificationType;
  message: string;
}): Promise<void> {
  await Notification.create({
    userId: input.userId,
    taskId: input.taskId,
    type: input.type,
    message: input.message,
    isRead: false,
  });
}

export async function notifyTaskAssigned(
  task: Task,
  assigneeId: number
): Promise<void> {
  await createNotification({
    userId: assigneeId,
    taskId: task.id,
    type: "assigned",
    message: `You have been assigned the task "${task.title}".`,
  });
}

export async function notifyTaskCompleted(task: Task): Promise<void> {
  const recipients = new Set<number>([task.assignedToId, task.createdById]);

  await Promise.all(
    [...recipients].map((userId) =>
      createNotification({
        userId,
        taskId: task.id,
        type: "completed",
        message: `Task "${task.title}" has been marked as complete.`,
      })
    )
  );
}

function todayDateOnly(): string {
  return new Date().toISOString().slice(0, 10);
}

function tomorrowDateOnly(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

export async function ensureDueSoonNotifications(
  userId: number
): Promise<void> {
  const today = todayDateOnly();
  const tomorrow = tomorrowDateOnly();

  const dueSoonTasks = await Task.findAll({
    where: {
      assignedToId: userId,
      status: { [Op.ne]: "completed" },
      dueDate: { [Op.between]: [today, tomorrow] },
    },
  });

  for (const task of dueSoonTasks) {
    const existing = await Notification.findOne({
      where: {
        userId,
        taskId: task.id,
        type: "due_soon",
      },
    });

    if (!existing) {
      await createNotification({
        userId,
        taskId: task.id,
        type: "due_soon",
        message: `Task "${task.title}" is due within one day (${task.dueDate}).`,
      });
    }
  }
}
