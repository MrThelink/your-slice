// TODO: Apply authMiddleware and adminMiddleware to POST, PUT, DELETE routes

import { Router } from 'express';
import { getAllCustomers } from '../controllers/customerController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();

// GET / - Apply admin middleware since this is for admin dashboard
router.get('/', authMiddleware, adminMiddleware, getAllCustomers);

export default router;