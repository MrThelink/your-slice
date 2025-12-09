// TODO: Apply authMiddleware and adminMiddleware to POST, PUT, DELETE routes

import { Router } from 'express';
import { getAllCustomers } from '../controllers/customerController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// GET / - Get all customers (requires authentication)
router.get('/', authMiddleware, getAllCustomers);

export default router;