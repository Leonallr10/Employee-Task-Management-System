import type { NextFunction, Request, Response } from "express";
import { User } from "../models/User";
import { verifyToken } from "../utils/jwt";
import { AppError } from "./errorHandler";

export interface AuthRequest extends Request {
  user?: User;
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  if (typeof req.cookies?.token === "string") {
    return req.cookies.token;
  }

  return null;
}

export async function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractToken(req);
    if (!token) {
      throw new AppError("Authentication required", 401);
    }

    const payload = verifyToken(token);
    const user = await User.findByPk(payload.userId);

    if (!user) {
      throw new AppError("User not found", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    next(new AppError("Invalid or expired token", 401));
  }
}
