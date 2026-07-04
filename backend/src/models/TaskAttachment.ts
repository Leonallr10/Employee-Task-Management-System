import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../config/database";
import type { Task } from "./Task";
import type { User } from "./User";

export class TaskAttachment extends Model<
  InferAttributes<TaskAttachment>,
  InferCreationAttributes<TaskAttachment>
> {
  declare id: CreationOptional<number>;
  declare taskId: ForeignKey<Task["id"]>;
  declare uploadedById: ForeignKey<User["id"]>;
  declare originalName: string;
  declare fileName: string;
  declare mimeType: string;
  declare size: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  toJSON() {
    return {
      id: this.id,
      taskId: this.taskId,
      uploadedById: this.uploadedById,
      originalName: this.originalName,
      fileName: this.fileName,
      mimeType: this.mimeType,
      size: this.size,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

TaskAttachment.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    taskId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "task_id",
    },
    uploadedById: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "uploaded_by_id",
    },
    originalName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "original_name",
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "file_name",
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "mime_type",
    },
    size: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "task_attachments",
    underscored: true,
  }
);
