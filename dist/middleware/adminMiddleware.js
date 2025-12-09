"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = void 0;
const db_1 = __importDefault(require("../config/db"));
const adminMiddleware = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
            return;
        }
        const result = await db_1.default.query('SELECT is_admin FROM customers WHERE id = $1', [req.user.id]);
        if (result.rows.length === 0 || !result.rows[0].is_admin) {
            res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
            return;
        }
        next();
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to verify admin access'
        });
    }
};
exports.adminMiddleware = adminMiddleware;
//# sourceMappingURL=adminMiddleware.js.map