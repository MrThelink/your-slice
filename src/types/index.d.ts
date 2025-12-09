import { Request } from 'express';

// TODO: Extend Express Request type to include req.user for JWT

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: 'customer' | 'admin';
      };
    }
  }
}