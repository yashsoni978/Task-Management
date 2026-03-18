import { Router } from "express";
import { body } from "express-validator";
import { authenticateToken } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  toggleTaskStatus,
} from "../controllers/taskController";

const router = Router();

// All task routes require authentication
router.use(authenticateToken);

router.get("/", getTasks);

router.post(
  "/",
  [body("title").notEmpty().withMessage("Title is required")],
  validate,
  createTask
);

router.get("/:id", getTaskById);

router.patch(
  "/:id",
  [
    body("title")
      .optional()
      .notEmpty()
      .withMessage("Title must not be empty"),
  ],
  validate,
  updateTask
);

router.patch("/:id/toggle", toggleTaskStatus);

router.delete("/:id", deleteTask);

export default router;
