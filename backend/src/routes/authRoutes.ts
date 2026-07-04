import { Router } from "express";
import {
  login,
  logout,
  me,
  register,
} from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import {
  loginValidators,
  registerValidators,
} from "../validators/authValidators";

const router = Router();

router.post("/register", registerValidators, validate, asyncHandler(register));
router.post("/login", loginValidators, validate, asyncHandler(login));
router.post("/logout", asyncHandler(logout));
router.get("/me", authenticate, asyncHandler(me));

export default router;
