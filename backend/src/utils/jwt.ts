import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { UserRole } from "../models/User";

export interface JwtPayload {
  userId: number;
  email: string;
  role: UserRole;
}

export function signToken(payload: JwtPayload, rememberMe = false): string {
  const expiresIn = rememberMe
    ? env.jwt.rememberExpiresIn
    : env.jwt.expiresIn;

  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwt.secret) as JwtPayload;
}
