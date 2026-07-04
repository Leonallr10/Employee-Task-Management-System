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
import type { User } from "./User";

export type TaskStatus = "pending" | "completed";

export class Task extends Model<
  InferAttributes<Task>,
  InferCreationAttributes<Task>
> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare description: CreationOptional<string | null>;
  declare status: CreationOptional<TaskStatus>;
  declare dueDate: Date;
  declare assignedToId: ForeignKey<User["id"]>;
  declare createdById: ForeignKey<User["id"]>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare assignee?: NonAttribute<User>;
  declare creator?: NonAttribute<User>;
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
    status: {
      type: DataTypes.ENUM("pending", "completed"),
      allowNull: false,
      defaultValue: "pending",
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
