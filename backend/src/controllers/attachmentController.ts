import fs from "fs";
import path from "path";
import type { Response } from "express";
import { UPLOAD_DIR } from "../config/upload";
import type { AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { Task, TaskAttachment } from "../models";

function assertCanAccessTask(req: AuthRequest, task: Task): void {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  if (req.user.role !== "admin" && task.assignedToId !== req.user.id) {
    throw new AppError("You do not have access to this task", 403);
  }
}

async function findTaskOrFail(taskId: string | number): Promise<Task> {
  const task = await Task.findByPk(taskId);
  if (!task) {
    throw new AppError("Task not found", 404);
  }
  return task;
}

export async function uploadTaskAttachment(
  req: AuthRequest,
  res: Response
): Promise<void> {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const task = await findTaskOrFail(req.params.id as string);
  assertCanAccessTask(req, task);

  if (!req.file) {
    throw new AppError("Please upload a PDF, JPG, or PNG file (max 5 MB)", 400);
  }

  const attachment = await TaskAttachment.create({
    taskId: task.id,
    uploadedById: req.user.id,
    originalName: req.file.originalname,
    fileName: req.file.filename,
    mimeType: req.file.mimetype,
    size: req.file.size,
  });

  res.status(201).json({
    success: true,
    message: "File uploaded successfully",
    data: { attachment: attachment.toJSON() },
  });
}

export async function downloadTaskAttachment(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const task = await findTaskOrFail(req.params.id as string);
  assertCanAccessTask(req, task);

  const attachment = await TaskAttachment.findOne({
    where: {
      id: req.params.attachmentId,
      taskId: task.id,
    },
  });

  if (!attachment) {
    throw new AppError("Attachment not found", 404);
  }

  const filePath = path.join(UPLOAD_DIR, attachment.fileName);
  if (!fs.existsSync(filePath)) {
    throw new AppError("File not found on server", 404);
  }

  res.download(filePath, attachment.originalName);
}

export async function deleteTaskAttachment(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const task = await findTaskOrFail(req.params.id as string);
  assertCanAccessTask(req, task);

  const attachment = await TaskAttachment.findOne({
    where: {
      id: req.params.attachmentId,
      taskId: task.id,
    },
  });

  if (!attachment) {
    throw new AppError("Attachment not found", 404);
  }

  const filePath = path.join(UPLOAD_DIR, attachment.fileName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await attachment.destroy();

  res.status(200).json({
    success: true,
    message: "Attachment deleted successfully",
  });
}
