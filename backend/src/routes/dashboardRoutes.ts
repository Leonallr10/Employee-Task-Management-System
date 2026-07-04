import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboardController";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/", authenticate, asyncHandler(getDashboardStats));

export default router;
