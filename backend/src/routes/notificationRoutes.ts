import { Router } from "express";
import { param } from "express-validator";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notificationController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(listNotifications));
router.patch("/read-all", asyncHandler(markAllNotificationsRead));
router.patch(
  "/:id/read",
  param("id").isInt({ min: 1 }).withMessage("Invalid notification id"),
  validate,
  asyncHandler(markNotificationRead)
);

export default router;
