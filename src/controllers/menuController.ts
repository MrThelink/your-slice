import { Request, Response } from 'express';
import pool from '../config/db';

// Menu Controller for Your Slice Restaurant
// 
// Database Schema Reference for GitHub Copilot:
// 
// Table: products  
//   Columns: id (PRIMARY KEY), name, description, price, is_vegan
//
// Table: lunch_menus (handles daily menu assignments)
//   Columns: id (PRIMARY KEY), date, product_id (FK), special_price
//   Relationships: lunch_menus.product_id → products.id
//
// Common Query Pattern: 
//   JOIN lunch_menus lm ON products.id = lm.product_id
//   WHERE lm.date = [target_date]

// Get today's menu - Query products joined with daily_menu for CURRENT_DATE
export const getTodayMenu = async (req: Request, res: Response) => {
  try {
    // Query products joined with lunch_menus for CURRENT_DATE
    const result = await pool.query(`
      SELECT 
        lm.id AS menu_id,
        lm.date AS menu_date,
        lm.special_price,
        p.id AS product_id,
        p.name,
        p.description,
        p.price AS base_price,
        p.is_vegan,
        COALESCE(lm.special_price, p.price) AS price
      FROM lunch_menus lm
      JOIN products p ON lm.product_id = p.id
      WHERE lm.date = CURRENT_DATE
      ORDER BY p.name
    `);
    
    // Return as JSON
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch today\'s menu'
    });
  }
};

// Get today's vegan menu items only
export const getTodayVeganMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT 
        lm.id AS menu_id,
        lm.date AS menu_date,
        lm.special_price,
        p.id AS product_id,
        p.name,
        p.description,
        p.price AS base_price,
        p.is_vegan,
        COALESCE(lm.special_price, p.price) AS price
      FROM lunch_menus lm
      JOIN products p ON lm.product_id = p.id
      WHERE lm.date = CURRENT_DATE AND p.is_vegan = true
      ORDER BY p.name
    `);
    
    res.json({
      success: true,
      data: result.rows,
      meta: {
        date: new Date().toISOString().split('T')[0],
        veganItemCount: result.rows.length
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch today\'s vegan menu'
    });
  }
};

// Get menu by specific date - Query products joined with daily_menu for given date
export const getMenuByDate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.params;
    
    // Validate date format
    if (!isValidDate(date)) {
      res.status(400).json({
        success: false,
        error: 'Invalid date format. Please use YYYY-MM-DD format'
      });
      return;
    }
    
    // Query products joined with lunch_menus for given date
    const result = await pool.query(`
      SELECT 
        lm.id AS menu_id,
        lm.date AS menu_date,
        lm.special_price,
        p.id AS product_id,
        p.name,
        p.description,
        p.price AS base_price,
        p.is_vegan,
        COALESCE(lm.special_price, p.price) AS price
      FROM lunch_menus lm
      JOIN products p ON lm.product_id = p.id
      WHERE lm.date = $1
      ORDER BY p.name
    `, [date]);
    
    // Return as JSON
    res.json({
      success: true,
      data: result.rows,
      meta: {
        date,
        itemCount: result.rows.length
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu for the specified date'
    });
  }
};

// Get menu statistics for a specific date
export const getMenuStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.params;
    
    if (!isValidDate(date)) {
      res.status(400).json({
        success: false,
        error: 'Invalid date format. Please use YYYY-MM-DD format'
      });
      return;
    }

    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_items,
        COUNT(CASE WHEN p.is_vegan = true THEN 1 END) as vegan_items,
        COUNT(CASE WHEN p.is_vegan = false THEN 1 END) as non_vegan_items,
        AVG(p.price) as average_price,
        MIN(p.price) as min_price,
        MAX(p.price) as max_price
      FROM lunch_menus lm
      JOIN products p ON lm.product_id = p.id
      WHERE lm.date = $1
    `, [date]);
    
    const stats = result.rows[0];
    
    res.json({
      success: true,
      data: {
        date,
        totalItems: parseInt(stats.total_items),
        veganItems: parseInt(stats.vegan_items),
        nonVeganItems: parseInt(stats.non_vegan_items),
        averagePrice: parseFloat(parseFloat(stats.average_price).toFixed(2)),
        minPrice: parseFloat(stats.min_price),
        maxPrice: parseFloat(stats.max_price)
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu statistics'
    });
  }
};

// Get menu for a date range - Query products joined with daily_menu for date range
export const getMenuByDateRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    
    // Validate date parameters
    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        error: 'Both startDate and endDate are required'
      });
      return;
    }
    
    // Query products joined with lunch_menus for date range
    const result = await pool.query(`
      SELECT 
        lm.id AS menu_id,
        lm.date AS menu_date,
        p.id AS product_id,
        p.name,
        p.description,
        p.price,
        p.is_vegan
      FROM lunch_menus lm
      JOIN products p ON lm.product_id = p.id
      WHERE lm.date BETWEEN $1 AND $2
      ORDER BY lm.date, p.name
    `, [startDate, endDate]);
    
    // Group results by date for easier frontend consumption
    const groupedData = result.rows.reduce((acc: any, item: any) => {
      const date = item.menu_date.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {});
    
    // Return as JSON
    res.json({
      success: true,
      data: groupedData,
      meta: {
        startDate,
        endDate,
        totalDays: Object.keys(groupedData).length,
        totalItems: result.rows.length
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu for the specified date range'
    });
  }
};

// Get weekly menu (7 days starting from specified date)
export const getWeeklyMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date();
    
    // Calculate end date (6 days later for a 7-day week)
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    const startDateStr = start.toISOString().split('T')[0];
    const endDateStr = end.toISOString().split('T')[0];
    
    const result = await pool.query(`
      SELECT 
        lm.id AS menu_id,
        lm.date AS menu_date,
        lm.special_price,
        p.id AS product_id,
        p.name,
        p.description,
        p.price AS base_price,
        p.is_vegan,
        COALESCE(lm.special_price, p.price) AS price
      FROM lunch_menus lm
      JOIN products p ON lm.product_id = p.id
      WHERE lm.date BETWEEN $1 AND $2
      ORDER BY lm.date, p.name
    `, [startDateStr, endDateStr]);
    
    // Group by date
    const weeklyMenu: { [key: string]: any[] } = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      weeklyMenu[dateStr] = [];
    }
    
    result.rows.forEach(item => {
      const dateStr = item.menu_date.toISOString().split('T')[0];
      if (weeklyMenu[dateStr]) {
        weeklyMenu[dateStr].push({
          ...item,
          effective_price: item.special_price || item.base_price
        });
      }
    });
    
    res.json({
      success: true,
      data: weeklyMenu,
      meta: {
        startDate: startDateStr,
        endDate: endDateStr,
        weekDays: Object.keys(weeklyMenu).map(date => ({
          date,
          dayName: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
          itemCount: weeklyMenu[date].length
        }))
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weekly menu'
    });
  }
};

// Update menu item price (special pricing for specific dates)
export const updateMenuItemPrice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { menuId } = req.params;
    const { special_price } = req.body;
    
    if (!special_price || special_price <= 0) {
      res.status(400).json({
        success: false,
        error: 'Valid special price is required'
      });
      return;
    }
    
    const result = await pool.query(
      'UPDATE lunch_menus SET special_price = $1 WHERE id = $2 RETURNING *',
      [special_price, menuId]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
      return;
    }
    
    res.json({
      success: true,
      message: 'Menu item price updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update menu item price'
    });
  }
};

// Reset menu item to base price
export const resetMenuItemPrice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { menuId } = req.params;
    
    const result = await pool.query(
      'UPDATE lunch_menus SET special_price = NULL WHERE id = $1 RETURNING *',
      [menuId]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
      return;
    }
    
    res.json({
      success: true,
      message: 'Menu item price reset to base price',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset menu item price'
    });
  }
};

// Bulk add products to multiple dates
export const bulkAddToMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const { product_ids, dates, special_price } = req.body;
    
    if (!product_ids || !dates || !Array.isArray(product_ids) || !Array.isArray(dates)) {
      res.status(400).json({
        success: false,
        error: 'Product IDs and dates arrays are required'
      });
      return;
    }
    
    const addedItems = [];
    const errors = [];
    
    for (const date of dates) {
      for (const product_id of product_ids) {
        try {
          // Check if item already exists
          const existingItem = await pool.query(
            'SELECT id FROM lunch_menus WHERE date = $1 AND product_id = $2',
            [date, product_id]
          );
          
          if (existingItem.rows.length === 0) {
            const result = await pool.query(
              'INSERT INTO lunch_menus (date, product_id, special_price) VALUES ($1, $2, $3) RETURNING *',
              [date, product_id, special_price || null]
            );
            addedItems.push(result.rows[0]);
          } else {
            errors.push(`Product ${product_id} already exists in menu for ${date}`);
          }
        } catch (error: any) {
          errors.push(`Failed to add product ${product_id} to ${date}: ${error.message}`);
        }
      }
    }
    
    res.json({
      success: true,
      message: `Added ${addedItems.length} items to menu`,
      data: {
        addedItems,
        errors: errors.length > 0 ? errors : null,
        summary: {
          totalAdded: addedItems.length,
          totalErrors: errors.length
        }
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bulk add items to menu'
    });
  }
};

// Get all available menu dates - Utility function to see what dates have menus
export const getAvailableMenuDates = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT date
      FROM lunch_menus
      ORDER BY date ASC
    `);
    
    // Return as JSON
    res.json({
      success: true,
      data: result.rows.map(row => row.date)
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available menu dates'
    });
  }
};

// Add item to lunch menu for a specific date
export const addToMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, product_id } = req.body;
    
    // Validate input
    if (!date || !product_id) {
      res.status(400).json({
        success: false,
        error: 'Date and product_id are required'
      });
      return;
    }
    
    if (!isValidDate(date)) {
      res.status(400).json({
        success: false,
        error: 'Invalid date format. Please use YYYY-MM-DD format'
      });
      return;
    }
    
    // Check if product exists
    const productCheck = await pool.query('SELECT id FROM products WHERE id = $1', [product_id]);
    if (productCheck.rows.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Product not found'
      });
      return;
    }
    
    // Check if item already exists in menu for this date
    const existingItem = await pool.query(
      'SELECT id FROM lunch_menus WHERE date = $1 AND product_id = $2',
      [date, product_id]
    );
    
    if (existingItem.rows.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Product already exists in menu for this date'
      });
      return;
    }
    
    // Add item to menu
    const result = await pool.query(
      'INSERT INTO lunch_menus (date, product_id) VALUES ($1, $2) RETURNING id',
      [date, product_id]
    );
    
    res.json({
      success: true,
      data: {
        menu_id: result.rows[0].id,
        date,
        product_id
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add item to menu'
    });
  }
};

// Remove item from lunch menu
export const removeFromMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const { menuId } = req.params;
    
    if (!menuId) {
      res.status(400).json({
        success: false,
        error: 'Menu ID is required'
      });
      return;
    }
    
    const result = await pool.query(
      'DELETE FROM lunch_menus WHERE id = $1 RETURNING id',
      [menuId]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
      return;
    }
    
    res.json({
      success: true,
      message: 'Item removed from menu successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove item from menu'
    });
  }
};

// Clear all items from menu for a specific date
export const clearMenuForDate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.params;
    
    if (!isValidDate(date)) {
      res.status(400).json({
        success: false,
        error: 'Invalid date format. Please use YYYY-MM-DD format'
      });
      return;
    }
    
    const result = await pool.query(
      'DELETE FROM lunch_menus WHERE date = $1',
      [date]
    );
    
    res.json({
      success: true,
      message: `Cleared ${result.rowCount} items from menu for ${date}`
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear menu'
    });
  }
};

// Validate date format helper function
const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime()) && !!dateString.match(/^\d{4}-\d{2}-\d{2}$/);
};