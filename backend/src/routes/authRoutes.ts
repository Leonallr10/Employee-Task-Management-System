import { Router } from "express";
import {
  login,
  logout,
  me,
  register,
} from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  loginValidators,
  registerValidators,
} from "../validators/authValidators";

const router = Router();

function asyncHandler(
  handler: (req: any, res: any, next: any) => Promise<void>
) {
  return (req: any, res: any, next: any) => {
    handler(req, res, next).catch(next);
  };
}

router.post("/register", registerValidators, validate, asyncHandler(register));
router.post("/login", loginValidators, validate, asyncHandler(login));
router.post("/logout", asyncHandler(logout));
router.get("/me", authenticate, asyncHandler(me));

export default router;
