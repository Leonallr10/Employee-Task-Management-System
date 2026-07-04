import dotenv from "dotenv";

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 5000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  clientUrl: required("CLIENT_URL", "http://localhost:5173"),
  db: {
    host: required("DB_HOST", "localhost"),
    port: Number(process.env.DB_PORT ?? 3306),
    name: required("DB_NAME", "task_management"),
    user: required("DB_USER", "root"),
    password: process.env.DB_PASSWORD ?? "",
  },
  jwt: {
    secret: required("JWT_SECRET", "dev_jwt_secret_change_in_production_32chars"),
    expiresIn: required("JWT_EXPIRES_IN", "1d"),
    rememberExpiresIn: required("JWT_REMEMBER_EXPIRES_IN", "30d"),
  },
};
