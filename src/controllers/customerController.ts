import { Request, Response } from 'express';
import pool from '../config/db';

// TODO: Implement getAllCustomers() for admin: fetch all customers from database
export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, created_at FROM customers ORDER BY created_at DESC'
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customers'
    });
  }
};