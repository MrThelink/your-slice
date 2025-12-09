import { Router } from 'express';
import { getAllProducts, createProduct, updateProduct, deleteProduct, getProductById } from '../controllers/productController';

const router = Router();

// GET / -> getAllProducts (public access for now, add auth later)
router.get('/', getAllProducts);

// GET /:id -> getProductById
router.get('/:id', getProductById);

// POST / -> createProduct (admin only - auth disabled for development)
router.post('/', createProduct);

// PUT /:id -> updateProduct (admin only - auth disabled for development)
router.put('/:id', updateProduct);

// DELETE /:id -> deleteProduct (admin only - auth disabled for development)
router.delete('/:id', deleteProduct);

export default router;