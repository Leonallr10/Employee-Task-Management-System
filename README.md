# Employee Task Management System

Full-stack Employee Task Management System built with:

- **Frontend:** React, TypeScript, Tailwind CSS, Redux Toolkit, React Hook Form, Zod
- **Backend:** Node.js, Express, TypeScript, JWT, Sequelize
- **Database:** MySQL

---

## Prerequisites

Install these before running the app:

| Tool | Version |
|------|---------|
| Node.js | 18 or later |
| npm | comes with Node.js |
| MySQL | 8 or later |

Make sure the MySQL service is running.

---

## Quick start

Open **two terminals** from the project root.

### 1. Configure the backend

```bash
cd backend
```

Copy the environment file:

```bash
# Windows (PowerShell / CMD)
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

Edit `backend/.env` and set your MySQL credentials:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=task_management
DB_USER=root
DB_PASSWORD=your_mysql_password

JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=1d
JWT_REMEMBER_EXPIRES_IN=30d

CLIENT_URL=http://localhost:5173
```

Important:

- Set `DB_PASSWORD` to your MySQL root password.
- Set `DB_PORT` to your MySQL port (`3306` is common; some installs use `3307`).
- Leave `DB_NAME` as `task_management` unless you intentionally change it.

### 2. (Optional) Create the database manually

The backend **creates the database and tables automatically** when it starts, if MySQL credentials are correct.

To create the schema yourself instead:

```bash
# Windows example (adjust path and port)
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -P 3306 -p < sql/schema.sql

# macOS / Linux
mysql -u root -p < sql/schema.sql
```

Run that command from the `backend` folder, or pass the full path to `backend/sql/schema.sql`.

### 3. Start the backend

From the `backend` folder:

```bash
npm install
npm run dev
```

You should see:

```text
Server running on http://localhost:5000
```

API health check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 4. Start the frontend

In a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

You should see Vite start on:

```text
http://localhost:5173
```

Open the app: [http://localhost:5173](http://localhost:5173)

---

## First-time usage

1. Open [http://localhost:5173/register](http://localhost:5173/register)
2. Register an **Admin** account:
   - Full Name
   - Email (must be unique)
   - Password (at least 8 characters, with uppercase, lowercase, and a number)
   - Confirm Password
   - Role: **Admin**
3. Log in and use:
   - **Dashboard** – stats
   - **Employees** – add employees (admin only)
   - **Tasks** – create/assign tasks and upload files
   - **Reports** – view and export CSV / Excel
   - **Notifications** – assignment, due soon, and completion alerts

Password example that passes validation: `Password1`

---

## Project structure

```text
.
├── backend/
│   ├── sql/
│   │   ├── schema.sql      # Full MySQL schema
│   │   └── init.sql
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   └── index.ts
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── pages/
    │   ├── store/
    │   ├── types/
    │   └── App.tsx
    └── package.json
```

---

## Features

### Authentication
- Register, login, logout
- JWT authentication
- Remember Me (30-day token in `localStorage`, or 1-day token in `sessionStorage`)
- Unique email
- Password rules: min 8 characters, uppercase, lowercase, and a number

### Dashboard
- **Admin:** total employees, total tasks, completed tasks, pending tasks
- **Employee:** my tasks, completed, pending, overdue tasks

### Employee Management (Admin only)
- Add, edit, delete, search, sort, paginate
- Fields: Name, Email, Department, Designation (plus initial password on create)

### Task Management
- Create, update, delete, view
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
- Completed Tasks, Pending Tasks, Employee-wise Tasks
- Export to Excel (`.xlsx`) and CSV

---

## API overview

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` or `/auth/register` | Register |
| POST | `/login` or `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Current user |
| GET | `/dashboard` | Dashboard stats |
| GET/POST/PUT/DELETE | `/employees` | Employee CRUD (admin) |
| GET/POST/PUT/DELETE | `/tasks` | Task CRUD |
| POST | `/tasks/:id/attachments` | Upload file |
| GET | `/tasks/:id/attachments/:attachmentId/download` | Download file |
| DELETE | `/tasks/:id/attachments/:attachmentId` | Delete file |
| GET | `/reports?type=&format=` | Reports (`completed`, `pending`, `employee`; `json`, `csv`, `xlsx`) |
| GET | `/notifications` | List notifications |
| PATCH | `/notifications/:id/read` | Mark one read |
| PATCH | `/notifications/read-all` | Mark all read |

### Register body

```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password1",
  "confirmPassword": "Password1",
  "role": "admin"
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

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Access denied for user 'root'@'localhost'` | Set the correct `DB_PASSWORD` and `DB_PORT` in `backend/.env` |
| Backend starts then crashes on DB connect | Confirm MySQL is running and credentials match `.env` |
| Frontend loads but API calls fail | Keep backend running on port `5000` and frontend on `5173` |
| Port already in use | Stop the other process, or change `PORT` in `.env` / Vite port in `frontend/vite.config.ts` |
| File upload fails | Use PDF, JPG, or PNG only, max 5 MB |

---

## Scripts

### Backend (`backend/`)

```bash
npm run dev      # development server with auto-reload
npm run build    # compile TypeScript to dist/
npm start        # run compiled server
```

### Frontend (`frontend/`)

```bash
npm run dev      # Vite development server
npm run build    # production build
npm run preview  # preview production build
```
