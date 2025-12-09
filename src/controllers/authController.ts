import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db';

// Register function - creates a new customer
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, first_name, last_name, age } = req.body;
    
    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
      return;
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT user_id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      res.status(409).json({
        success: false,
        error: 'Email already registered'
      });
      return;
    }
    
    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert into users table
    const result = await pool.query(
      'INSERT INTO users (first_name, last_name, email, password_hash, age) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, email, first_name',
      [first_name || '', last_name || '', email, hashedPassword, age || null]
    );
    
    const user = result.rows[0];
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.user_id, email: user.email },
      process.env.JWT_SECRET || 'default-secret-key-change-in-production',
      { expiresIn: '7d' }
    );
    
    // Return success message with token
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: user.user_id,
        email: user.email,
        name: user.first_name,
        token: token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
};

// Login function - authenticates a customer and returns a JWT token
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
      return;
    }
    
    // Find customer by email
    const result = await pool.query(
      'SELECT user_id, email, password_hash, first_name, is_admin FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
      return;
    }
    
    const user = result.rows[0];
    
    // Verify password with bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
      return;
    }
    
    // Generate JWT token with JWT_SECRET
    const token = jwt.sign(
      { id: user.user_id, email: user.email, isAdmin: user.is_admin },
      process.env.JWT_SECRET || 'default-secret-key-change-in-production',
      { expiresIn: '7d' }
    );
    
    // Return token and customer info
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        customer: {
          id: user.user_id,
          email: user.email,
          name: user.first_name,
          isAdmin: user.is_admin
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
};