import { body } from "express-validator";
import {
  PASSWORD_REGEX,
  PASSWORD_RULE_MESSAGE,
} from "../utils/password";

export const registerValidators = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 120 })
    .withMessage("Full name must be between 2 and 120 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .matches(PASSWORD_REGEX)
    .withMessage(PASSWORD_RULE_MESSAGE),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["admin", "employee"])
    .withMessage("Role must be either Admin or Employee"),
];

export const loginValidators = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  body("rememberMe")
    .optional()
    .isBoolean()
    .withMessage("Remember me must be a boolean"),
];
