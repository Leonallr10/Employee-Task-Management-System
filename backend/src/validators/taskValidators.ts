import { body, param, query } from "express-validator";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const listTaskValidators = [
  query("page")
    .optional({ values: "falsy" })
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional({ values: "falsy" })
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
  query("search").optional({ values: "falsy" }).isString(),
  query("status")
    .optional({ values: "falsy" })
    .isIn(["pending", "in_progress", "completed"])
    .withMessage("Invalid status filter"),
  query("priority")
    .optional({ values: "falsy" })
    .isIn(["low", "medium", "high"])
    .withMessage("Invalid priority filter"),
  query("sortBy")
    .optional({ values: "falsy" })
    .isIn([
      "title",
      "priority",
      "status",
      "startDate",
      "dueDate",
      "createdAt",
    ])
    .withMessage("Invalid sort field"),
  query("sortOrder")
    .optional({ values: "falsy" })
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be asc or desc"),
];

export const taskIdValidator = [
  param("id").isInt({ min: 1 }).withMessage("Invalid task id"),
];

const sharedTaskBody = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 200 })
    .withMessage("Title must be at most 200 characters"),
  body("description")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Description must be at most 2000 characters"),
  body("priority")
    .notEmpty()
    .withMessage("Priority is required")
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be low, medium, or high"),
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["pending", "in_progress", "completed"])
    .withMessage("Status must be pending, in_progress, or completed"),
  body("startDate")
    .notEmpty()
    .withMessage("Start date is required")
    .matches(dateRegex)
    .withMessage("Start date must be in YYYY-MM-DD format"),
  body("dueDate")
    .notEmpty()
    .withMessage("Due date is required")
    .matches(dateRegex)
    .withMessage("Due date must be in YYYY-MM-DD format")
    .custom((dueDate, { req }) => {
      if (dueDate < req.body.startDate) {
        throw new Error("Due date must not be earlier than start date");
      }
      return true;
    }),
  body("assignedToId")
    .notEmpty()
    .withMessage("Assigned employee is required")
    .isInt({ min: 1 })
    .withMessage("Assigned employee is invalid")
    .toInt(),
];

export const createTaskValidators = [...sharedTaskBody];

export const updateTaskValidators = [...taskIdValidator, ...sharedTaskBody];
