"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const adminMiddleware_1 = require("../middleware/adminMiddleware");
const router = (0, express_1.Router)();
router.post('/', orderController_1.createOrder);
router.get('/', authMiddleware_1.authMiddleware, adminMiddleware_1.adminMiddleware, orderController_1.getAllOrders);
exports.default = router;
//# sourceMappingURL=orderRoutes.js.map