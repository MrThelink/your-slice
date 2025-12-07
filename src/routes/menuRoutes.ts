// TODO: Create express.Router()
// - GET /today -> use menuController.getTodayMenu
// - GET /:date -> use menuController.getMenuByDate
// - Export router

import { Router } from 'express';
import { 
  getTodayMenu, 
  getTodayVeganMenu,
  getMenuByDate, 
  getMenuByDateRange, 
  getMenuStats,
  getAvailableMenuDates,
  addToMenu,
  removeFromMenu,
  clearMenuForDate,
  getWeeklyMenu,
  updateMenuItemPrice,
  resetMenuItemPrice,
  bulkAddToMenu
} from '../controllers/menuController';

const router = Router();

// GET /today -> use menuController.getTodayMenu
router.get('/today', getTodayMenu);

// GET /today/vegan -> use menuController.getTodayVeganMenu  
router.get('/today/vegan', getTodayVeganMenu);

// GET /weekly -> use menuController.getWeeklyMenu
router.get('/weekly', getWeeklyMenu);

// GET /dates -> use menuController.getAvailableMenuDates  
router.get('/dates', getAvailableMenuDates);

// GET /range -> use menuController.getMenuByDateRange
router.get('/range', getMenuByDateRange);

// GET /stats/:date -> use menuController.getMenuStats
router.get('/stats/:date', getMenuStats);

// POST / -> add item to menu
router.post('/', addToMenu);

// POST /bulk -> bulk add items to menu
router.post('/bulk', bulkAddToMenu);

// PUT /price/:menuId -> update menu item price
router.put('/price/:menuId', updateMenuItemPrice);

// PUT /reset-price/:menuId -> reset menu item price to base
router.put('/reset-price/:menuId', resetMenuItemPrice);

// DELETE /:menuId -> remove item from menu
router.delete('/:menuId', removeFromMenu);

// DELETE /clear/:date -> clear all items for date
router.delete('/clear/:date', clearMenuForDate);

// GET /:date -> use menuController.getMenuByDate (must be last)
router.get('/:date', getMenuByDate);

// Export router
export default router;