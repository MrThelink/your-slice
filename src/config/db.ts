// Database Configuration for Your Slice Restaurant
// 
// Database Schema Documentation for GitHub Copilot:
// 
// Table: users
//   Columns: user_id (SERIAL PRIMARY KEY), first_name (VARCHAR), last_name (VARCHAR), 
//           email (VARCHAR UNIQUE), password_hash (VARCHAR), age (INTEGER), 
//           is_admin (BOOLEAN), created_at (TIMESTAMP), updated_at (TIMESTAMP)
//
// Table: products  
//   Columns: id (SERIAL PRIMARY KEY), name (VARCHAR), description (TEXT), 
//           price (DECIMAL), is_vegan (BOOLEAN)
//
// Table: lunch_menus (handles daily menu assignments)
//   Columns: id (SERIAL PRIMARY KEY), product_id (INTEGER FK), date (DATE)
//   Note: Join with products table using product_id
//
// Table: orders
//   Columns: order_id (SERIAL PRIMARY KEY), customer_id (INTEGER FK), total_amount (DECIMAL),
//           order_status (VARCHAR), delivery_address (TEXT), phone_number (VARCHAR),
//           order_date (TIMESTAMP), estimated_delivery (TIMESTAMP)
//
// Table: order_items
//   Columns: item_id (SERIAL PRIMARY KEY), order_id (INTEGER FK), product_id (INTEGER FK),
//           quantity (INTEGER), unit_price (DECIMAL), item_total (DECIMAL)

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Explicit database connection for local development
// Use DATABASE_URL from .env if available, otherwise fall back to direct connection
const pool = new Pool(
  process.env.DATABASE_URL 
    ? { connectionString: process.env.DATABASE_URL }
    : {
        user: 'abdulaljubury',
        host: '127.0.0.1',
        database: 'yourslice',
        // password: process.env.DB_PASSWORD, // Uncomment if password is required
        port: 5432,
      }
);

// Test the connection and log success (optional for development)
pool.connect()
  .then((client) => {
    console.log('Connected to PostgreSQL database');
    client.release();
  })
  .catch((error) => {
    console.log('⚠️  PostgreSQL connection failed - running in development mode without database');
    console.log('To fix: Set up PostgreSQL with correct credentials in .env file');
  });

export default pool;