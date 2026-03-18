"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
const jwt_1 = require("../utils/jwt");
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Access token is missing" });
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        req.userId = decoded.userId;
        next();
    }
    catch {
        res.status(401).json({ error: "Invalid or expired access token" });
    }
}
//# sourceMappingURL=auth.js.map