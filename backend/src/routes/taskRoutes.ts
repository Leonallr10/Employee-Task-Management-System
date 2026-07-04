import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
} from "../controllers/taskController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import {
  createTaskValidators,
  listTaskValidators,
  taskIdValidator,
  updateTaskValidators,
} from "../validators/taskValidators";

const router = Router();

router.use(authenticate);

router.get("/", listTaskValidators, validate, asyncHandler(listTasks));
router.get("/:id", taskIdValidator, validate, asyncHandler(getTask));
router.post("/", createTaskValidators, validate, asyncHandler(createTask));
router.put("/:id", updateTaskValidators, validate, asyncHandler(updateTask));
router.delete("/:id", taskIdValidator, validate, asyncHandler(deleteTask));

export default router;
