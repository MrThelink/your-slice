import { Request, Response } from 'express';
import pool from '../config/db';

// TODO: Implement createOrder()
// - Accept customer_id and items array [{product_id, quantity}]
// - Insert into orders table, calculate total
// - Insert each item into order_items
// - Return created order
export const createOrder = async (req: Request, res: Response) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Accept customer_id and items array [{product_id, quantity}]
    const { customer_id, items } = req.body;
    
    // Calculate total from product prices
    let total = 0;
    for (const item of items) {
      const priceResult = await client.query('SELECT price FROM products WHERE id = $1', [item.product_id]);
      if (priceResult.rows.length > 0) {
        total += priceResult.rows[0].price * item.quantity;
      }
    }
    
    // Insert into orders table, calculate total
    const orderResult = await client.query(
      'INSERT INTO orders (customer_id, total, status, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, total, status, created_at',
      [customer_id, total, 'pending']
    );
    
    const createdOrder = orderResult.rows[0];
    
    // Insert each item into order_items
    for (const item of items) {
      const priceResult = await client.query('SELECT price FROM products WHERE id = $1', [item.product_id]);
      const itemPrice = priceResult.rows[0]?.price || 0;
      
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [createdOrder.id, item.product_id, item.quantity, itemPrice]
      );
    }
    
    await client.query('COMMIT');
    
    // Return created order
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order_id: createdOrder.id,
        customer_id,
        total: createdOrder.total,
        status: createdOrder.status,
        created_at: createdOrder.created_at,
        items
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({
      success: false,
      error: 'Failed to create order'
    });
  } finally {
    client.release();
  }
};

// TODO: Implement getAllOrders()
// - Join orders with customers and order_items
// - Return JSON for admin dashboard
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
            'price', oi.price,
            'product_name', p.name
          )
        ) as items
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      GROUP BY o.id, o.total, o.status, o.created_at, c.id, c.name, c.email
      ORDER BY o.created_at DESC
    `);
    
    // Return JSON for admin dashboard
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
};