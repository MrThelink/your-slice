"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductById = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getAllProducts = void 0;
const db_1 = __importDefault(require("../config/db"));
const getAllProducts = async (req, res) => {
    try {
        const result = await db_1.default.query('SELECT * FROM products ORDER BY name');
        res.json({
            success: true,
            data: result.rows
        });
    }
    catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch products'
        });
    }
};
exports.getAllProducts = getAllProducts;
const createProduct = async (req, res) => {
    try {
        const { name, description, price, is_vegan } = req.body;
        if (!name || !price) {
            res.status(400).json({
                success: false,
                error: 'Name and price are required'
            });
            return;
        }
        const result = await db_1.default.query('INSERT INTO products (name, description, price, is_vegan) VALUES ($1, $2, $3, $4) RETURNING *', [name, description, price, is_vegan || false]);
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: result.rows[0]
        });
    }
    catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create product'
        });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, is_vegan } = req.body;
        if (!name || !price) {
            res.status(400).json({
                success: false,
                error: 'Name and price are required'
            });
            return;
        }
        const result = await db_1.default.query('UPDATE products SET name = $1, description = $2, price = $3, is_vegan = $4 WHERE id = $5 RETURNING *', [name, description, price, is_vegan || false, id]);
        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'Product not found'
            });
            return;
        }
        res.json({
            success: true,
            message: 'Product updated successfully',
            data: result.rows[0]
        });
    }
    catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update product'
        });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.default.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'Product not found'
            });
            return;
        }
        res.json({
            success: true,
            message: 'Product deleted successfully',
            data: { deletedId: result.rows[0].id }
        });
    }
    catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete product'
        });
    }
};
exports.deleteProduct = deleteProduct;
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.default.query('SELECT * FROM products WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'Product not found'
            });
            return;
        }
        res.json({
            success: true,
            data: result.rows[0]
        });
    }
    catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch product'
        });
    }
};
exports.getProductById = getProductById;
//# sourceMappingURL=productController.js.map