// TODO: Apply authMiddleware to POST /api/orders
// - Use createOrder controller
// - This route allows customers to create orders

// TODO: Apply authMiddleware and adminMiddleware to GET /api/orders
// - Use getAllOrders controller
// - This route allows only admins to fetch all orders

import { Router } from 'express';
import { createOrder, getAllOrders } from '../controllers/orderController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();

// TODO: Apply authMiddleware to POST /api/orders
// - Use createOrder controller
// - This route allows customers to create orders
router.post('/', authMiddleware, createOrder);

// TODO: Apply authMiddleware and adminMiddleware to GET /api/orders
// - Use getAllOrders controller
// - This route allows only admins to fetch all orders
router.get('/', authMiddleware, adminMiddleware, getAllOrders);

// Export router
export default router;