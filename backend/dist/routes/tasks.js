"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const taskController_1 = require("../controllers/taskController");
const router = (0, express_1.Router)();
// All task routes require authentication
router.use(auth_1.authenticateToken);
router.get("/", taskController_1.getTasks);
router.post("/", [(0, express_validator_1.body)("title").notEmpty().withMessage("Title is required")], validate_1.validate, taskController_1.createTask);
router.get("/:id", taskController_1.getTaskById);
router.patch("/:id", [
    (0, express_validator_1.body)("title")
        .optional()
        .notEmpty()
        .withMessage("Title must not be empty"),
], validate_1.validate, taskController_1.updateTask);
router.patch("/:id/toggle", taskController_1.toggleTaskStatus);
router.delete("/:id", taskController_1.deleteTask);
exports.default = router;
//# sourceMappingURL=tasks.js.map