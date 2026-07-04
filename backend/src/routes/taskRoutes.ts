import { Router } from "express";
import { param } from "express-validator";
import {
  deleteTaskAttachment,
  downloadTaskAttachment,
  uploadTaskAttachment,
} from "../controllers/attachmentController";
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
} from "../controllers/taskController";
import { authenticate } from "../middleware/auth";
import { upload } from "../middleware/upload";
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

router.post(
  "/:id/attachments",
  taskIdValidator,
  validate,
  upload.single("file"),
  asyncHandler(uploadTaskAttachment)
);

router.get(
  "/:id/attachments/:attachmentId/download",
  taskIdValidator,
  param("attachmentId").isInt({ min: 1 }).withMessage("Invalid attachment id"),
  validate,
  asyncHandler(downloadTaskAttachment)
);

router.delete(
  "/:id/attachments/:attachmentId",
  taskIdValidator,
  param("attachmentId").isInt({ min: 1 }).withMessage("Invalid attachment id"),
  validate,
  asyncHandler(deleteTaskAttachment)
);

export default router;
