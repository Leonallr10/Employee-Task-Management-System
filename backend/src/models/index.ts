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

export { Task, User };
export type { TaskStatus } from "./Task";
export type { UserRole } from "./User";
