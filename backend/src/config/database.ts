import { Sequelize } from "sequelize";
import { env } from "./env";

export const sequelize = new Sequelize(
  env.db.name,
  env.db.user,
  env.db.password,
  {
    host: env.db.host,
    port: env.db.port,
    dialect: "mysql",
    logging: env.nodeEnv === "development" ? console.log : false,
  }
);

async function ensureDatabaseExists(): Promise<void> {
  const rootConnection = new Sequelize("", env.db.user, env.db.password, {
    host: env.db.host,
    port: env.db.port,
    dialect: "mysql",
    logging: false,
  });

  try {
    await rootConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${env.db.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
  } finally {
    await rootConnection.close();
  }
}

export async function connectDatabase(): Promise<void> {
  await ensureDatabaseExists();
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
}
