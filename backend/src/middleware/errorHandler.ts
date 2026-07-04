import type { NextFunction, Request, Response } from "express";
import { ValidationError as SequelizeValidationError } from "sequelize";

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  if (err instanceof SequelizeValidationError) {
    res.status(400).json({
      success: false,
      message: err.errors[0]?.message ?? "Validation failed",
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
