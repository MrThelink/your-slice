import { Request, Response } from 'express';
import pool from '../config/db';

// Get all registered customers from database
export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT 
        id, 
        name, 
        email, 
        created_at 
       FROM customers 
       ORDER BY created_at DESC`
    );
    
    res.json({
      success: true,
      data: result.rows.map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        createdAt: customer.created_at
      }))
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customers'
    });
  }
};