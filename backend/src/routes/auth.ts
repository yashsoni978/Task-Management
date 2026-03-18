import { Router } from "express";
import { body } from "express-validator";
import rateLimit from "express-rate-limit";
import { register, login, refresh, logout, getCurrentUser } from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router = Router();

// Rate limiter for auth routes: max 10 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: "Too many requests, please try again later" },
});

router.post(
  "/register",
  authLimiter,
  [
    body("email").isEmail().withMessage("A valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validate,
  register
);

router.post(
  "/login",
  authLimiter,
  [
    body("email").isEmail().withMessage("A valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login
);

router.post("/refresh", refresh);

router.post("/logout", logout);

router.get("/me", authenticateToken, getCurrentUser);

export default router;
