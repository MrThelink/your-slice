"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({
                success: false,
                error: 'Authorization header missing'
            });
            return;
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({
                success: false,
                error: 'Bearer token missing'
            });
            return;
        }
        console.log('Verifying token with secret:', process.env.JWT_SECRET || 'default-secret-key-change-in-production');
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default-secret-key-change-in-production');
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role || 'customer'
        };
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=authMiddleware.js.map