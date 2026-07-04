import { body, param, query } from "express-validator";
import {
  PASSWORD_REGEX,
  PASSWORD_RULE_MESSAGE,
} from "../utils/password";

export const listEmployeeValidators = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
  query("search").optional().isString(),
  query("sortBy")
    .optional()
    .isIn(["fullName", "email", "department", "designation", "createdAt"])
    .withMessage("Invalid sort field"),
  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be asc or desc"),
];

export const employeeIdValidator = [
  param("id").isInt({ min: 1 }).withMessage("Invalid employee id"),
];

export const createEmployeeValidators = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 120 })
    .withMessage("Name must be between 2 and 120 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("department")
    .trim()
    .notEmpty()
    .withMessage("Department is required")
    .isLength({ max: 120 })
    .withMessage("Department must be at most 120 characters"),
  body("designation")
    .trim()
    .notEmpty()
    .withMessage("Designation is required")
    .isLength({ max: 120 })
    .withMessage("Designation must be at most 120 characters"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .matches(PASSWORD_REGEX)
    .withMessage(PASSWORD_RULE_MESSAGE),
];

export const updateEmployeeValidators = [
  ...employeeIdValidator,
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 120 })
    .withMessage("Name must be between 2 and 120 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("department")
    .trim()
    .notEmpty()
    .withMessage("Department is required")
    .isLength({ max: 120 })
    .withMessage("Department must be at most 120 characters"),
  body("designation")
    .trim()
    .notEmpty()
    .withMessage("Designation is required")
    .isLength({ max: 120 })
    .withMessage("Designation must be at most 120 characters"),
  body("password")
    .optional({ values: "falsy" })
    .matches(PASSWORD_REGEX)
    .withMessage(PASSWORD_RULE_MESSAGE),
];
