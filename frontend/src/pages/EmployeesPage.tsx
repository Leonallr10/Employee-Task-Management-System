import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import {
  createEmployee,
  deleteEmployee,
  fetchEmployees,
  updateEmployee,
} from "../api/employees";
import PasswordInput from "../components/PasswordInput";
import type { Employee } from "../types/employee";

const passwordRule = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[0-9]/, "Password must include a number");

const employeeSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(120, "Name must be at most 120 characters"),
    email: z.email("Please enter a valid email address"),
    department: z
      .string()
      .trim()
      .min(1, "Department is required")
      .max(120, "Department must be at most 120 characters"),
    designation: z
      .string()
      .trim()
      .min(1, "Designation is required")
      .max(120, "Designation must be at most 120 characters"),
    password: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (!values.password) {
      return;
    }
    const result = passwordRule.safeParse(values.password);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        ctx.addIssue({
          code: "custom",
          message: issue.message,
          path: ["password"],
        });
      });
    }
  });

type EmployeeFormValues = z.infer<typeof employeeSchema>;

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

const fieldInputClass = `mt-1 ${inputClass}`;

const labelClass = "block text-sm font-medium text-slate-700";

type SortField =
  | "fullName"
  | "email"
  | "department"
  | "designation"
  | "createdAt";

function getErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { message?: string } } }).response
      ?.data?.message === "string"
  ) {
    return (error as { response: { data: { message: string } } }).response.data
      .message;
  }
  return fallback;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      fullName: "",
      email: "",
      department: "",
      designation: "",
      password: "",
    },
  });

  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchEmployees({
        page,
        limit,
        search,
        sortBy,
        sortOrder,
      });
      setEmployees(response.data.employees);
      setTotalPages(response.data.pagination.totalPages);
      setTotal(response.data.pagination.total);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load employees"));
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder]);

  useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const openCreateModal = () => {
    setEditingEmployee(null);
    reset({
      fullName: "",
      email: "",
      department: "",
      designation: "",
      password: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    reset({
      fullName: employee.fullName,
      email: employee.email,
      department: employee.department ?? "",
      designation: employee.designation ?? "",
      password: "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  const onSubmit = async (values: EmployeeFormValues) => {
    if (!editingEmployee && !values.password) {
      toast.error("Password is required when adding an employee");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        fullName: values.fullName,
        email: values.email,
        department: values.department,
        designation: values.designation,
        ...(values.password ? { password: values.password } : {}),
      };

      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, payload);
        toast.success("Employee updated successfully");
      } else {
        await createEmployee({
          ...payload,
          password: values.password,
        });
        toast.success("Employee created successfully");
      }

      closeModal();
      await loadEmployees();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save employee"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (employee: Employee) => {
    const confirmed = window.confirm(
      `Delete employee "${employee.fullName}"? This cannot be undone.`
    );
    if (!confirmed) {
      return;
    }

    try {
      await deleteEmployee(employee.id);
      toast.success("Employee deleted successfully");
      if (employees.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadEmployees();
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete employee"));
    }
  };

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const sortIndicator = (field: SortField) => {
    if (sortBy !== field) {
      return "";
    }
    return sortOrder === "asc" ? " ↑" : " ↓";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Employee Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Add, edit, search, and manage employees
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Add Employee
        </button>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by name, email, department, or designation"
            className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
          <p className="text-sm text-slate-500">{total} employee(s)</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                {(
                  [
                    ["fullName", "Name"],
                    ["email", "Email"],
                    ["department", "Department"],
                    ["designation", "Designation"],
                  ] as const
                ).map(([field, label]) => (
                  <th key={field} className="px-4 py-3 font-semibold">
                    <button
                      type="button"
                      onClick={() => handleSort(field)}
                      className="inline-flex items-center gap-1 hover:text-slate-800"
                    >
                      {label}
                      {sortIndicator(field)}
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    Loading employees...
                  </td>
                </tr>
              )}

              {!loading && employees.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No employees found.
                  </td>
                </tr>
              )}

              {!loading &&
                employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {employee.fullName}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {employee.email}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {employee.department || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {employee.designation || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(employee)}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(employee)}
                          className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingEmployee ? "Edit Employee" : "Add Employee"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-sm text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              <div>
                <label htmlFor="fullName" className={labelClass}>
                  Name
                </label>
                <input
                  id="fullName"
                  className={fieldInputClass}
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className={fieldInputClass}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="department" className={labelClass}>
                  Department
                </label>
                <input
                  id="department"
                  className={fieldInputClass}
                  {...register("department")}
                />
                {errors.department && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.department.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="designation" className={labelClass}>
                  Designation
                </label>
                <input
                  id="designation"
                  className={fieldInputClass}
                  {...register("designation")}
                />
                {errors.designation && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.designation.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className={labelClass}>
                  {editingEmployee
                    ? "Password (optional)"
                    : "Password"}
                </label>
                <PasswordInput
                  id="password"
                  className={inputClass}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.password.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-400">
                  {editingEmployee
                    ? "Leave blank to keep the current password"
                    : "Initial login password for this employee"}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingEmployee
                      ? "Update Employee"
                      : "Create Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
