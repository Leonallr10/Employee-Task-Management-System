-- Creates the application database only.
-- Tables are created automatically by the backend on startup (Sequelize sync),
-- or you can load the full schema with:
--   mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS task_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
