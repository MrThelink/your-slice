// TODO: Create express.Router()
// - POST /register -> use authController.register
// - POST /login -> use authController.login
// - Export router

import { Router } from 'express';
import { register, login } from '../controllers/authController';

const router = Router();

// POST /register -> use authController.register
router.post('/register', register);

// POST /login -> use authController.login
router.post('/login', login);

// Export router
export default router;