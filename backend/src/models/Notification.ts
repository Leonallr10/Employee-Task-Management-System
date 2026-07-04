import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from "sequelize";
import { sequelize } from "../config/database";
import type { Task } from "./Task";
import type { User } from "./User";

export type NotificationType = "assigned" | "due_soon" | "completed";

export class Notification extends Model<
  InferAttributes<Notification>,
  InferCreationAttributes<Notification>
> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User["id"]>;
  declare taskId: ForeignKey<Task["id"]> | null;
  declare type: NotificationType;
  declare message: string;
  declare isRead: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare task?: NonAttribute<Task>;

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      taskId: this.taskId,
      type: this.type,
      message: this.message,
      isRead: this.isRead,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      task: this.task
        ? {
            id: this.task.id,
            title: this.task.title,
            status: this.task.status,
            dueDate: this.task.dueDate,
          }
        : null,
    };
  }
}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "user_id",
    },
    taskId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: "task_id",
    },
    type: {
      type: DataTypes.ENUM("assigned", "due_soon", "completed"),
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_read",
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "notifications",
    underscored: true,
  }
);
