import { Request, Response, NextFunction } from 'express';
import pool from '../config/db';

// TODO: Create adminMiddleware
// - Use req.user (from authMiddleware)
// - Check if user exists in admins table
// - If admin, allow next()
// - If not admin, respond with 403 Forbidden
export const adminMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }
    const result = await pool.query(
      'SELECT is_admin FROM customers WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0 || !result.rows[0].is_admin) {
      res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
      return;
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to verify admin access'
    });
  }
};