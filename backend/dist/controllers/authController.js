"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.refresh = refresh;
exports.logout = logout;
exports.getCurrentUser = getCurrentUser;
const client_1 = require("@prisma/client");
const hash_1 = require("../utils/hash");
const jwt_1 = require("../utils/jwt");
const prisma = new client_1.PrismaClient({});
async function register(req, res) {
    const { email, password } = req.body;
    try {
        // Check for duplicate email
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(409).json({ error: "Email already in use" });
            return;
        }
        // Hash password and create user
        const hashed = await (0, hash_1.hashPassword)(password);
        const user = await prisma.user.create({
            data: { email, password: hashed },
        });
        res.status(201).json({
            user: { id: user.id, email: user.email },
        });
    }
    catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
async function login(req, res) {
    const { email, password } = req.body;
    try {
        // Find user by email
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ error: "Invalid email or password" });
            return;
        }
        // Compare password
        const isValid = await (0, hash_1.comparePassword)(password, user.password);
        if (!isValid) {
            res.status(401).json({ error: "Invalid email or password" });
            return;
        }
        // Generate tokens
        const accessToken = (0, jwt_1.generateAccessToken)(user.id);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
        // Save refresh token to DB
        await prisma.refreshToken.create({
            data: { token: refreshToken, userId: user.id },
        });
        res.status(200).json({
            accessToken,
            refreshToken,
            user: { id: user.id, email: user.email },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
async function refresh(req, res) {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        res.status(400).json({ error: "Refresh token is required" });
        return;
    }
    try {
        // Verify the refresh token signature
        const decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
        // Check it exists in DB
        const storedToken = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
        });
        if (!storedToken) {
            res.status(401).json({ error: "Refresh token not found or already used" });
            return;
        }
        // Delete the old refresh token (rotation)
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });
        // Generate new token pair
        const newAccessToken = (0, jwt_1.generateAccessToken)(decoded.userId);
        const newRefreshToken = (0, jwt_1.generateRefreshToken)(decoded.userId);
        // Save new refresh token to DB
        await prisma.refreshToken.create({
            data: { token: newRefreshToken, userId: decoded.userId },
        });
        res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    }
    catch {
        res.status(401).json({ error: "Invalid or expired refresh token" });
    }
}
async function logout(req, res) {
    const { refreshToken } = req.body;
    try {
        if (refreshToken) {
            await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
        }
        res.status(200).json({ message: "Logged out" });
    }
    catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
async function getCurrentUser(req, res) {
    try {
        const userId = req.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true },
        });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error("Get current user error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
//# sourceMappingURL=authController.js.map