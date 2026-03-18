"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
// Rate limiter for auth routes: max 10 requests per 15 minutes
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { error: "Too many requests, please try again later" },
});
router.post("/register", authLimiter, [
    (0, express_validator_1.body)("email").isEmail().withMessage("A valid email is required"),
    (0, express_validator_1.body)("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
], validate_1.validate, authController_1.register);
router.post("/login", authLimiter, [
    (0, express_validator_1.body)("email").isEmail().withMessage("A valid email is required"),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Password is required"),
], validate_1.validate, authController_1.login);
router.post("/refresh", authController_1.refresh);
router.post("/logout", authController_1.logout);
router.get("/me", auth_1.authenticateToken, authController_1.getCurrentUser);
exports.default = router;
//# sourceMappingURL=auth.js.map