import { Request, Response } from 'express';
import pool from '../config/db';

// Product Controller for Your Slice Restaurant
// 
// Database Schema Reference:
// Table: products (id, name, description, price, is_vegan)

// Get all products
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT * FROM products ORDER BY name'
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
};

// Create a new product
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, is_vegan } = req.body;
    
    // Validate input
    if (!name || !price) {
      res.status(400).json({
        success: false,
        error: 'Name and price are required'
      });
      return;
    }
    
    const result = await pool.query(
      'INSERT INTO products (name, description, price, is_vegan) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, price, is_vegan || false]
    );
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product'
    });
  }
};

// Update a product
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, price, is_vegan } = req.body;
    
    // Validate input
    if (!name || !price) {
      res.status(400).json({
        success: false,
        error: 'Name and price are required'
      });
      return;
    }
    
    const result = await pool.query(
      'UPDATE products SET name = $1, description = $2, price = $3, is_vegan = $4 WHERE id = $5 RETURNING *',
      [name, description, price, is_vegan || false, id]
    );
    
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
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product'
    });
  }
};

// Delete a product
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING id',
      [id]
    );
    
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
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product'
    });
  }
};

// Get product by ID
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );
    
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
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product'
    });
  }
};
