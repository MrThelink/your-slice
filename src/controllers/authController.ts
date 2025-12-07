import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db';

// TODO: Implement register function
// - Accept email, password, name
// - Hash password with bcrypt
// - Insert into customers table
// - Return success message
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    
    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert into customers table
    const result = await pool.query(
      'INSERT INTO customers (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, hashedPassword, name]
    );
    
    // Return success message
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
};

// TODO: Implement login function
// - Accept email, password
// - Verify password with bcrypt
// - Generate JWT token with JWT_SECRET
// - Return token and customer info
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Find customer by email
    const result = await pool.query(
      'SELECT id, email, password, name FROM customers WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    const customer = result.rows[0];
    
    // Verify password with bcrypt
    const isValidPassword = await bcrypt.compare(password, customer.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Generate JWT token with JWT_SECRET
    const token = jwt.sign(
      { userId: customer.id, email: customer.email },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );
    
    // Return token and customer info
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        customer: {
          id: customer.id,
          email: customer.email,
          name: customer.name
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
};