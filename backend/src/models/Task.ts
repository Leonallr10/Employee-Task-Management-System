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
import type { TaskAttachment } from "./TaskAttachment";
import type { User } from "./User";

export type TaskStatus = "pending" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export class Task extends Model<
  InferAttributes<Task>,
  InferCreationAttributes<Task>
> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare description: CreationOptional<string | null>;
  declare priority: CreationOptional<TaskPriority>;
  declare status: CreationOptional<TaskStatus>;
  declare startDate: Date | string;
  declare dueDate: Date | string;
  declare assignedToId: ForeignKey<User["id"]>;
  declare createdById: ForeignKey<User["id"]>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare assignee?: NonAttribute<User>;
  declare creator?: NonAttribute<User>;
  declare attachments?: NonAttribute<TaskAttachment[]>;

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      priority: this.priority,
      status: this.status,
      startDate: this.startDate,
      dueDate: this.dueDate,
      assignedToId: this.assignedToId,
      createdById: this.createdById,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      assignee: this.assignee
        ? {
            id: this.assignee.id,
            fullName: this.assignee.fullName,
            email: this.assignee.email,
            department: this.assignee.department,
            designation: this.assignee.designation,
          }
        : undefined,
      creator: this.creator
        ? {
            id: this.creator.id,
            fullName: this.creator.fullName,
            email: this.creator.email,
          }
        : undefined,
      attachments: this.attachments?.map((attachment) => attachment.toJSON()) ?? [],
    };
  }
}

Task.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high"),
      allowNull: false,
      defaultValue: "medium",
    },
    status: {
      type: DataTypes.ENUM("pending", "in_progress", "completed"),
      allowNull: false,
      defaultValue: "pending",
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "start_date",
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "due_date",
    },
    assignedToId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "assigned_to_id",
    },
    createdById: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "created_by_id",
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "tasks",
    underscored: true,
  }
);
