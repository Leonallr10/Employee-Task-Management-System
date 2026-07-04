import { Router } from "express";
import {
  createEmployee,
  deleteEmployee,
  getEmployee,
  listEmployees,
  updateEmployee,
} from "../controllers/employeeController";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import {
  createEmployeeValidators,
  employeeIdValidator,
  listEmployeeValidators,
  updateEmployeeValidators,
} from "../validators/employeeValidators";

const router = Router();

router.use(authenticate, authorize("admin"));

router.get(
  "/",
  listEmployeeValidators,
  validate,
  asyncHandler(listEmployees)
);
router.get(
  "/:id",
  employeeIdValidator,
  validate,
  asyncHandler(getEmployee)
);
router.post(
  "/",
  createEmployeeValidators,
  validate,
  asyncHandler(createEmployee)
);
router.put(
  "/:id",
  updateEmployeeValidators,
  validate,
  asyncHandler(updateEmployee)
);
router.delete(
  "/:id",
  employeeIdValidator,
  validate,
  asyncHandler(deleteEmployee)
);

export default router;
