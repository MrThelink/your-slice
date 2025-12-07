import { Request, Response, NextFunction } from 'express';
import pool from '../config/db';

// TODO: Create adminMiddleware
// - Use req.user (from authMiddleware)
// - Check if user exists in admins table
// - If admin, allow next()
// - If not admin, respond with 403 Forbidden
export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Use req.user (from authMiddleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // Check if user exists in admins table
    const result = await pool.query(
      'SELECT id FROM admins WHERE user_id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      // If not admin, respond with 403 Forbidden
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }
    
    // If admin, allow next()
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to verify admin access'
    });
  }
};