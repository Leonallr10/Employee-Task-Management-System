import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const PASSWORD_RULE_MESSAGE =
  "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
