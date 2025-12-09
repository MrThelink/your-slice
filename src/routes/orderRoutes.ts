// POST /api/orders - Create order (no auth required for guest orders)
// GET /api/orders - Get all orders (admin only)

import { Router } from 'express';
import { createOrder, getAllOrders } from '../controllers/orderController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();

// POST - Create order (allows both authenticated users and guests)
// Authenticated users: customer_id/user_id will be extracted from token
// Guest customers: provide customer details (name, email, phone, address)
router.post('/', createOrder);

// GET - Fetch all orders (admin only)
// Requires both auth and admin middleware
router.get('/', authMiddleware, adminMiddleware, getAllOrders);

// Export router
export default router;