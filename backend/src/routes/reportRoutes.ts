import { Router } from "express";
import { query } from "express-validator";
import { getReports } from "../controllers/reportController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get(
  "/",
  authenticate,
  query("type")
    .notEmpty()
    .withMessage("Report type is required")
    .isIn(["completed", "pending", "employee"])
    .withMessage("Report type must be completed, pending, or employee"),
  query("format")
    .optional({ values: "falsy" })
    .isIn(["json", "csv", "xlsx"])
    .withMessage("Format must be json, csv, or xlsx"),
  validate,
  asyncHandler(getReports)
);

export default router;
