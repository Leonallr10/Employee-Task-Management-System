import type { NextFunction, Response } from "express";
import type { AuthRequest } from "./auth";
import { AppError } from "./errorHandler";
import type { UserRole } from "../models/User";

export function authorize(...roles: UserRole[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("Authentication required", 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError("You do not have permission to perform this action", 403));
      return;
    }

    next();
  };
}
