import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// TODO: Create authMiddleware
// - Check if Authorization header has Bearer token
// - Verify JWT using JWT_SECRET from .env
// - If valid, attach user info to req.user
// - If invalid or missing, respond with 401 Unauthorized
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Check if Authorization header has Bearer token
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: 'Authorization header missing'
      });
      return;
    }
    
    const token = authHeader.split(' ')[1]; // Bearer <token>
    
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Bearer token missing'
      });
      return;
    }
    
    console.log('Verifying token with secret:', process.env.JWT_SECRET || 'default-secret-key-change-in-production');
    
    // Verify JWT using JWT_SECRET from .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key-change-in-production') as any;
    
    // If valid, attach user info to req.user
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'customer'
    };
    
    next();
  } catch (error) {
    // If invalid or missing, respond with 401 Unauthorized
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};