import type { Response } from "express";
import { UniqueConstraintError } from "sequelize";
import { env } from "../config/env";
import type { AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { User, type UserRole } from "../models/User";
import { signToken } from "../utils/jwt";
import { comparePassword, hashPassword } from "../utils/password";

const COOKIE_NAME = "token";

function cookieMaxAge(rememberMe: boolean): number {
  return rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
}

function setAuthCookie(
  res: Response,
  token: string,
  rememberMe: boolean
): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    maxAge: cookieMaxAge(rememberMe),
  });
}

function clearAuthCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
  });
}

export async function register(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { fullName, email, password, role } = req.body as {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
  };

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  try {
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role,
    });

    const token = signToken(
      { userId: user.id, email: user.email, role: user.role },
      false
    );
    setAuthCookie(res, token, false);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: user.toSafeJSON(),
        token,
      },
    });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new AppError("Email is already registered", 409);
    }
    throw error;
  }
}

export async function login(req: AuthRequest, res: Response): Promise<void> {
  const { email, password, rememberMe = false } = req.body as {
    email: string;
    password: string;
    rememberMe?: boolean;
  };

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken(
    { userId: user.id, email: user.email, role: user.role },
    Boolean(rememberMe)
  );
  setAuthCookie(res, token, Boolean(rememberMe));

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: user.toSafeJSON(),
      token,
      rememberMe: Boolean(rememberMe),
    },
  });
}

export async function logout(_req: AuthRequest, res: Response): Promise<void> {
  clearAuthCookie(res);
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
}

export async function me(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  res.status(200).json({
    success: true,
    data: {
      user: req.user.toSafeJSON(),
    },
  });
}
