# Employee Task Management System

Full-stack app with JWT authentication (Node.js + Express + MySQL + React + TypeScript + Tailwind CSS).

## Features (Authentication)

- User registration (Full Name, Email, Password, Confirm Password, Role)
- Login with JWT
- Remember Me (30-day token in `localStorage` vs 1-day token in `sessionStorage`)
- Logout
- Validation:
  - Email must be unique
  - Password must be at least 8 characters and include uppercase, lowercase, and a number

## Prerequisites

- Node.js 18+
- MySQL 8+

## Setup

### 1. Database

Create the database:

```sql
CREATE DATABASE IF NOT EXISTS task_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Or run:

```bash
mysql -u root -p < backend/sql/init.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
```

Update `.env` with your MySQL credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=task_management
DB_USER=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173
```

Install and start:

```bash
npm install
npm run dev
```

API runs at `http://localhost:5000`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`.

## Features

### Dashboard
- **Admin:** total employees, total tasks, completed tasks, pending tasks
- **Employee:** my tasks, completed, pending, overdue tasks

### Employee Management (Admin only)
- Add, edit, delete employees
- Search, sort, and paginate
- Fields: Name, Email, Department, Designation (plus initial password on create)

### Task Management
- Create, update, delete, and view tasks
- Fields: Title, Description, Priority, Status, Start Date, Due Date, Assigned Employee
- Due date cannot be earlier than start date
- Completed tasks cannot be edited
- Employees see only their own tasks; admins see all tasks

### Notifications
- Task assigned
- Task due within one day
- Task marked complete

### File Upload
- Attach PDF, JPG, or PNG files to tasks (max 5 MB)

### Reports
- Completed Tasks, Pending Tasks, and Employee-wise Task reports
- Export to Excel (`.xlsx`) and CSV

## Auth API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login (optional `rememberMe`) |
| POST | `/api/auth/logout` | Logout and clear cookie |
| GET | `/api/auth/me` | Current user (JWT required) |

## Dashboard & Employees API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Role-based dashboard stats |
| GET | `/api/employees` | List employees (`search`, `sortBy`, `sortOrder`, `page`, `limit`) |
| POST | `/api/employees` | Create employee (admin) |
| PUT | `/api/employees/:id` | Update employee (admin) |
| DELETE | `/api/employees/:id` | Delete employee (admin) |

## Tasks, Files, Reports & Notifications API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register`, `/api/login` | Auth aliases (also under `/api/auth`) |
| GET/POST/PUT/DELETE | `/api/employees` | Employee CRUD (admin) |
| GET/POST/PUT/DELETE | `/api/tasks` | Task CRUD |
| POST | `/api/tasks/:id/attachments` | Upload PDF/JPG/PNG (max 5 MB) |
| GET | `/api/tasks/:id/attachments/:attachmentId/download` | Download file |
| DELETE | `/api/tasks/:id/attachments/:attachmentId` | Delete file |
| GET | `/api/reports?type=&format=` | Reports (`completed`, `pending`, `employee`; `json`, `csv`, `xlsx`) |
| GET | `/api/notifications` | List notifications |
| PATCH | `/api/notifications/:id/read` | Mark one notification read |
| PATCH | `/api/notifications/read-all` | Mark all notifications read |

### Register body

```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password1",
  "confirmPassword": "Password1",
  "role": "employee"
}
```

`role` must be `"admin"` or `"employee"`.

### Login body

```json
{
  "email": "jane@example.com",
  "password": "Password1",
  "rememberMe": true
}
```
