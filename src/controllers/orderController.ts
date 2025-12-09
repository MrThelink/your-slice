import { Request, Response } from 'express';
import pool from '../config/db';

// Create order from frontend (handles both authenticated users and guests)
export const createOrder = async (req: Request, res: Response) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Accept either customer_id (authenticated) or customer details (guest)
    const { 
      customer_id, 
      user_id,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      items,
      subtotal,
      tax,
      total,
      status = 'new'
    } = req.body;
    
    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        error: 'items array is required'
      });
      return;
    }

    // Determine the customer_id or create guest record
    let finalCustomerId = customer_id || user_id;
    
    // If no customer_id provided, create a guest customer record
    if (!finalCustomerId) {
      if (!customer_email) {
        res.status(400).json({
          success: false,
          error: 'Either customer_id or customer_email is required'
        });
        return;
      }
      
      // Try to get or create customer
      const customerCheck = await client.query(
        'SELECT id FROM customers WHERE email = $1',
        [customer_email]
      );
      
      if (customerCheck.rows.length > 0) {
        finalCustomerId = customerCheck.rows[0].id;
      } else {
        // Create a guest customer (password can be placeholder for guest orders)
        const guestResult = await client.query(
          'INSERT INTO customers (email, password, name, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id',
          [customer_email, 'guest_order', customer_name || 'Guest']
        );
        finalCustomerId = guestResult.rows[0].id;
      }
    }
    
    // Insert into orders table using correct column names
    const orderResult = await client.query(
      `INSERT INTO orders (customer_id, total, status, created_at) 
       VALUES ($1, $2, $3, NOW()) 
       RETURNING id, total, status, created_at`,
      [finalCustomerId, total || subtotal, status]
    );
    
    const createdOrder = orderResult.rows[0];
    
    // Insert each item into order_items (items come pre-formatted from frontend)
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity) 
         VALUES ($1, $2, $3)`,
        [
          createdOrder.id, 
          item.id || null,  // product_id might be null for custom items
          item.quantity || 1
        ]
      );
    }
    
    await client.query('COMMIT');
    
    // Return created order
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order_id: createdOrder.id,
        customer_id: finalCustomerId,
        customer_name,
        customer_email,
        customer_phone,
        customer_address,
        total: createdOrder.total,
        subtotal: subtotal,
        tax: tax,
        status: createdOrder.status,
        created_at: createdOrder.created_at,
        items: items.length
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order'
    });
  } finally {
    client.release();
  }
};

// Get all orders (for admin dashboard)
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    // Join orders with customers and order_items
    const result = await pool.query(`
      SELECT 
        o.id as order_id,
        o.total,
        o.status,
        o.created_at,
        c.id as customer_id,
        c.name as customer_name,
        c.email as customer_email,
        json_agg(
          json_build_object(
            'product_id', oi.product_id,
            'quantity', oi.quantity,
            'product_name', p.name
          ) ORDER BY oi.id
        ) FILTER (WHERE oi.id IS NOT NULL) as items
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      GROUP BY o.id, o.total, o.status, o.created_at, c.id, c.name, c.email
      ORDER BY o.created_at DESC
    `);
    
    // Return JSON for admin dashboard
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
};