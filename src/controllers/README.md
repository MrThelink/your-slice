# Menu Controller API Documentation

## Overview

The Menu Controller handles all menu-related operations for Your Slice Restaurant. It provides endpoints to retrieve daily menus, search by dates, and get menu availability information.

## Database Schema

```sql
-- Products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(6,2) NOT NULL,
  is_vegan BOOLEAN
);

-- Lunch menus table (daily menu assignments)
CREATE TABLE lunch_menus (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  product_id INTEGER REFERENCES products(id)
);
```

## API Endpoints

### GET /api/menu/today

**Description:** Get today's menu items  
**Returns:** JSON with success status and array of menu items for current date

**Response Example:**

```json
{
  "success": true,
  "data": [
    {
      "menu_id": 1,
      "menu_date": "2025-11-24T22:00:00.000Z",
      "product_id": 1,
      "name": "Margherita",
      "description": "Classic pizza with tomato and cheese",
      "price": "8.50",
      "is_vegan": false
    }
  ]
}
```

### GET /api/menu/:date

**Description:** Get menu items for a specific date  
**Parameters:**

- `date` (string): Date in YYYY-MM-DD format

**Response Example:**

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "date": "2025-11-24",
    "itemCount": 2
  }
}
```

### GET /api/menu/range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD

**Description:** Get menu items for a date range  
**Query Parameters:**

- `startDate` (string): Start date in YYYY-MM-DD format
- `endDate` (string): End date in YYYY-MM-DD format

**Response Example:**

```json
{
  "success": true,
  "data": {
    "2025-11-24": [...],
    "2025-11-25": [...]
  },
  "meta": {
    "startDate": "2025-11-24",
    "endDate": "2025-11-26",
    "totalDays": 2,
    "totalItems": 4
  }
}
```

### GET /api/menu/dates

**Description:** Get all available menu dates  
**Returns:** JSON with array of dates that have menu items

**Response Example:**

```json
{
  "success": true,
  "data": [
    "2025-11-23T22:00:00.000Z",
    "2025-11-24T22:00:00.000Z",
    "2025-11-25T22:00:00.000Z"
  ]
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error description"
}
```

**Common Error Codes:**

- 400: Invalid date format or missing parameters
- 500: Database connection or query errors

## Testing Examples

```bash
# Get today's menu
curl "http://localhost:3001/api/menu/today"

# Get menu for specific date
curl "http://localhost:3001/api/menu/2025-11-24"

# Get menu for date range
curl "http://localhost:3001/api/menu/range?startDate=2025-11-24&endDate=2025-11-26"

# Get available dates
curl "http://localhost:3001/api/menu/dates"

# Test error handling
curl "http://localhost:3001/api/menu/invalid-date"
```
