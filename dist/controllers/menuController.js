"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearMenuForDate = exports.removeFromMenu = exports.addToMenu = exports.getAvailableMenuDates = exports.bulkAddToMenu = exports.resetMenuItemPrice = exports.updateMenuItemPrice = exports.getWeeklyMenu = exports.getMenuByDateRange = exports.getMenuStats = exports.getMenuByDate = exports.getTodayVeganMenu = exports.getTodayMenu = void 0;
const db_1 = __importDefault(require("../config/db"));
const getTodayMenu = async (req, res) => {
    try {
        const result = await db_1.default.query(`
      SELECT 
        dm.menu_id,
        dm.menu_date,
        p.product_id,
        p.name,
        p.description,
        p.price,
        p.is_vegan
      FROM daily_menu dm
      JOIN products p ON dm.product_id = p.product_id
      WHERE dm.menu_date = CURRENT_DATE
      ORDER BY p.name
    `);
        res.json({
            success: true,
            data: result.rows
        });
    }
    catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch today\'s menu'
        });
    }
};
exports.getTodayMenu = getTodayMenu;
const getTodayVeganMenu = async (req, res) => {
    try {
        const result = await db_1.default.query(`
      SELECT 
        dm.menu_id,
        dm.menu_date,
        dm.special_price,
        p.product_id,
        p.name,
        p.description,
        p.price AS base_price,
        p.is_vegan,
        COALESCE(dm.special_price, p.price) AS price
      FROM daily_menu dm
      JOIN products p ON dm.product_id = p.product_id
      WHERE dm.menu_date = CURRENT_DATE AND p.is_vegan = true
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
    }
    catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch today\'s vegan menu'
        });
    }
};
exports.getTodayVeganMenu = getTodayVeganMenu;
const getMenuByDate = async (req, res) => {
    try {
        const { date } = req.params;
        if (!isValidDate(date)) {
            res.status(400).json({
                success: false,
                error: 'Invalid date format. Please use YYYY-MM-DD format'
            });
            return;
        }
        const result = await db_1.default.query(`
      SELECT 
        dm.menu_id,
        dm.menu_date,
        dm.special_price,
        p.product_id,
        p.name,
        p.description,
        p.price AS base_price,
        p.is_vegan,
        COALESCE(dm.special_price, p.price) AS price
      FROM daily_menu dm
      JOIN products p ON dm.product_id = p.product_id
      WHERE dm.menu_date = $1
      ORDER BY p.name
    `, [date]);
        res.json({
            success: true,
            data: result.rows,
            meta: {
                date,
                itemCount: result.rows.length
            }
        });
    }
    catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch menu for the specified date'
        });
    }
};
exports.getMenuByDate = getMenuByDate;
const getMenuStats = async (req, res) => {
    try {
        const { date } = req.params;
        if (!isValidDate(date)) {
            res.status(400).json({
                success: false,
                error: 'Invalid date format. Please use YYYY-MM-DD format'
            });
            return;
        }
        const result = await db_1.default.query(`
      SELECT 
        COUNT(*) as total_items,
        COUNT(CASE WHEN p.is_vegan = true THEN 1 END) as vegan_items,
        COUNT(CASE WHEN p.is_vegan = false THEN 1 END) as non_vegan_items,
        AVG(p.price) as average_price,
        MIN(p.price) as min_price,
        MAX(p.price) as max_price
      FROM daily_menu dm
      JOIN products p ON dm.product_id = p.product_id
      WHERE dm.menu_date = $1
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
    }
    catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch menu statistics'
        });
    }
};
exports.getMenuStats = getMenuStats;
const getMenuByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            res.status(400).json({
                success: false,
                error: 'Both startDate and endDate are required'
            });
            return;
        }
        const result = await db_1.default.query(`
      SELECT 
        dm.menu_id,
        dm.menu_date,
        p.product_id,
        p.name,
        p.description,
        p.price,
        p.is_vegan
      FROM daily_menu dm
      JOIN products p ON dm.product_id = p.product_id
      WHERE dm.menu_date BETWEEN $1 AND $2
      ORDER BY dm.menu_date, p.name
    `, [startDate, endDate]);
        const groupedData = result.rows.reduce((acc, item) => {
            const date = item.menu_date.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(item);
            return acc;
        }, {});
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
    }
    catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch menu for the specified date range'
        });
    }
};
exports.getMenuByDateRange = getMenuByDateRange;
const getWeeklyMenu = async (req, res) => {
    try {
        const { startDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date();
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        const startDateStr = start.toISOString().split('T')[0];
        const endDateStr = end.toISOString().split('T')[0];
        const result = await db_1.default.query(`
      SELECT 
        dm.menu_id,
        dm.menu_date,
        dm.special_price,
        p.product_id,
        p.name,
        p.description,
        p.price AS base_price,
        p.is_vegan,
        COALESCE(dm.special_price, p.price) AS price
      FROM daily_menu dm
      JOIN products p ON dm.product_id = p.product_id
      WHERE dm.menu_date BETWEEN $1 AND $2
      ORDER BY dm.menu_date, p.name
    `, [startDateStr, endDateStr]);
        const weeklyMenu = {};
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
    }
    catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch weekly menu'
        });
    }
};
exports.getWeeklyMenu = getWeeklyMenu;
const updateMenuItemPrice = async (req, res) => {
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
        const result = await db_1.default.query('UPDATE daily_menu SET special_price = $1 WHERE menu_id = $2 RETURNING *', [special_price, menuId]);
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
    }
    catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update menu item price'
        });
    }
};
exports.updateMenuItemPrice = updateMenuItemPrice;
const resetMenuItemPrice = async (req, res) => {
    try {
        const { menuId } = req.params;
        const result = await db_1.default.query('UPDATE daily_menu SET special_price = NULL WHERE menu_id = $1 RETURNING *', [menuId]);
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
    }
    catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to reset menu item price'
        });
    }
};
exports.resetMenuItemPrice = resetMenuItemPrice;
const bulkAddToMenu = async (req, res) => {
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
                    const existingItem = await db_1.default.query('SELECT menu_id FROM daily_menu WHERE menu_date = $1 AND product_id = $2', [date, product_id]);
                    if (existingItem.rows.length === 0) {
                        const result = await db_1.default.query('INSERT INTO daily_menu (product_id, menu_date, special_price) VALUES ($1, $2, $3) RETURNING *', [product_id, date, special_price || null]);
                        addedItems.push(result.rows[0]);
                    }
                    else {
                        errors.push(`Product ${product_id} already exists in menu for ${date}`);
                    }
                }
                catch (error) {
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
    }
    catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to bulk add items to menu'
        });
    }
};
exports.bulkAddToMenu = bulkAddToMenu;
const getAvailableMenuDates = async (req, res) => {
    try {
        const result = await db_1.default.query(`
      SELECT DISTINCT menu_date as date
      FROM daily_menu
      ORDER BY menu_date ASC
    `);
        res.json({
            success: true,
            data: result.rows.map(row => row.date)
        });
    }
    catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch available menu dates'
        });
    }
};
exports.getAvailableMenuDates = getAvailableMenuDates;
const addToMenu = async (req, res) => {
    try {
        const { date, product_id } = req.body;
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
        const productCheck = await db_1.default.query('SELECT id FROM products WHERE id = $1', [product_id]);
        if (productCheck.rows.length === 0) {
            res.status(400).json({
                success: false,
                error: 'Product not found'
            });
            return;
        }
        const existingItem = await db_1.default.query('SELECT menu_id FROM daily_menu WHERE menu_date = $1 AND product_id = $2', [date, product_id]);
        if (existingItem.rows.length > 0) {
            res.status(400).json({
                success: false,
                error: 'Product already exists in menu for this date'
            });
            return;
        }
        const result = await db_1.default.query('INSERT INTO daily_menu (product_id, menu_date) VALUES ($1, $2) RETURNING menu_id', [product_id, date]);
        res.json({
            success: true,
            data: {
                menu_id: result.rows[0].menu_id,
                date,
                product_id
            }
        });
    }
    catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add item to menu'
        });
    }
};
exports.addToMenu = addToMenu;
const removeFromMenu = async (req, res) => {
    try {
        const { menuId } = req.params;
        if (!menuId) {
            res.status(400).json({
                success: false,
                error: 'Menu ID is required'
            });
            return;
        }
        const result = await db_1.default.query('DELETE FROM daily_menu WHERE menu_id = $1 RETURNING menu_id', [menuId]);
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
    }
    catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to remove item from menu'
        });
    }
};
exports.removeFromMenu = removeFromMenu;
const clearMenuForDate = async (req, res) => {
    try {
        const { date } = req.params;
        if (!isValidDate(date)) {
            res.status(400).json({
                success: false,
                error: 'Invalid date format. Please use YYYY-MM-DD format'
            });
            return;
        }
        const result = await db_1.default.query('DELETE FROM lunch_menus WHERE date = $1', [date]);
        res.json({
            success: true,
            message: `Cleared ${result.rowCount} items from menu for ${date}`
        });
    }
    catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to clear menu'
        });
    }
};
exports.clearMenuForDate = clearMenuForDate;
const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime()) && !!dateString.match(/^\d{4}-\d{2}-\d{2}$/);
};
//# sourceMappingURL=menuController.js.map