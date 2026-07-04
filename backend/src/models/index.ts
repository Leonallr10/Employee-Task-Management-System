import { Notification } from "./Notification";
import { Task } from "./Task";
import { User } from "./User";

User.hasMany(Task, {
  foreignKey: "assignedToId",
  as: "assignedTasks",
  onDelete: "CASCADE",
});

User.hasMany(Task, {
  foreignKey: "createdById",
  as: "createdTasks",
  onDelete: "CASCADE",
});

Task.belongsTo(User, {
  foreignKey: "assignedToId",
  as: "assignee",
  onDelete: "CASCADE",
});

Task.belongsTo(User, {
  foreignKey: "createdById",
  as: "creator",
  onDelete: "CASCADE",
});

User.hasMany(Notification, {
  foreignKey: "userId",
  as: "notifications",
  onDelete: "CASCADE",
});

Notification.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
  onDelete: "CASCADE",
});

Task.hasMany(Notification, {
  foreignKey: "taskId",
  as: "notifications",
  onDelete: "CASCADE",
});

Notification.belongsTo(Task, {
  foreignKey: "taskId",
  as: "task",
  onDelete: "CASCADE",
});

export { Notification, Task, User };
export type { NotificationType } from "./Notification";
export type { TaskPriority, TaskStatus } from "./Task";
export type { UserRole } from "./User";
