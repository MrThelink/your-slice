# Your Slice Admin Dashboard

A modern, responsive admin panel for managing orders, customers, and menu items with real-time backend integration.

## 📋 Features

### Dashboard (`/admin/adminPage.html`)

- **Real-time Statistics**
  - New orders count
  - Processing orders count
  - Completed orders today
  - Today's revenue total
- **Recent Orders Management**
  - Display of latest 10 orders
  - Status indicators (New, Processing, Completed)
  - Quick actions (View, Edit, Complete, Cancel)
  - Order filtering by status
- **User Management**
  - User profile display
  - Logout functionality
  - Session persistence with localStorage

### Orders Page (`/orders page/orders.html`)

- **Complete Orders List**
  - All orders from backend
  - Real-time data fetching
  - Search functionality across order details
  - Status filtering (All, New, Processing, Completed)
- **Order Management**
  - Change order status
  - View order details
  - Edit orders
  - Quick status updates via dropdown

### Customers Page (`/customer page/customer.html`)

- **Customer Statistics**
  - Total customers
  - New customers this week
  - Admin user count
  - Last updated timestamp
- **Customer List**
  - Complete customer database
  - Join date information
  - Customer status
  - Refresh functionality

### Menu Management (`/menu page/menu.html`)

- Ready for menu item management
- Daily menu configuration
- Menu item creation and editing
- Bulk import capability (structure in place)

## 🚀 Quick Start

### Prerequisites

- Node.js 14+
- Backend API running on `http://localhost:5000`
- Modern web browser

### Setup

1. **Start Backend API**

```bash
cd backend
npm install
npm run dev
# Backend runs on http://localhost:5000
```

2. **Start Frontend**
   Option A - Using VS Code Live Server:

- Right-click `admin-page/admin/adminPage.html`
- Select "Open with Live Server"
- Opens on http://127.0.0.1:5500

Option B - Using Python:

```bash
python3 -m http.server 5500
# Then visit http://127.0.0.1:5500/admin-page/admin/adminPage.html
```

3. **Login**

- Email: `admin@metropolia.fi`
- Password: `Admin123`

## 📁 File Structure

```
admin-page/
├── shared/                 # Shared components and utilities
│   ├── admin-styles.css   # Standardized CSS for all pages
│   ├── api-client.js      # Backend API communication layer
│   ├── sidebar-manager.js # Navigation management
│   └── sidebar.html       # Reusable sidebar component
│
├── admin/                 # Dashboard
│   ├── adminPage.html    # Main dashboard HTML
│   ├── admin.js          # Dashboard logic and data loading
│   └── admin.css         # Dashboard-specific styles
│
├── orders page/          # Orders management
│   ├── orders.html       # Orders page HTML
│   ├── orders.js         # Orders logic and interactions
│   └── orders.css        # Orders-specific styles
│
├── customer page/        # Customer management
│   ├── customer.html     # Customers page HTML
│   ├── customer.js       # Customer logic and interactions
│   └── customer.css      # Customer-specific styles
│
├── menu page/            # Menu management
│   ├── menu.html         # Menu management HTML
│   ├── menu.js           # Menu logic (to be implemented)
│   └── menu.css          # Menu-specific styles
│
└── loginJS/
    └── login.js          # Authentication handling
```

## 🔌 API Integration

### Backend Endpoints Used

The admin dashboard communicates with the following backend API endpoints:

#### Orders API

- `GET /api/orders` - Fetch all orders
- `PUT /api/orders/:id` - Update order status

#### Customers API

- `GET /api/customers` - Fetch all customers

#### Menu API

- `GET /api/menu/today` - Today's menu
- `GET /api/menu/weekly` - Weekly menu
- `GET /api/menu/:date` - Menu by specific date

#### Products API

- `GET /api/products` - Get all products

### API Client (`api-client.js`)

Centralized API communication with:

- Automatic token management
- Error handling and logging
- Request/response interception
- Auto-logout on 401 Unauthorized

**Usage Example:**

```javascript
// Fetch orders
const response = await apiClient.getOrders();
const orders = response.data;

// Update order status
await apiClient.updateOrderStatus(orderId, "completed");

// Get dashboard stats
const stats = await apiClient.getDashboardStats();
```

## 🎨 Design System

### Colors

- **Primary**: `#e74c3c` (Red) - Buttons, highlights
- **Secondary**: `#2c3e50` (Dark Blue-Gray) - Sidebar, headers
- **Success**: `#2ecc71` (Green) - Completed status
- **Warning**: `#f39c12` (Orange) - Processing status
- **Danger**: `#e74c3c` (Red) - Errors, cancelled status

### Responsive Breakpoints

- **Desktop**: 1200px+ - Full layout
- **Tablet**: 768px - 1199px - Adjusted grid
- **Mobile**: 480px - 767px - Single column
- **Small Mobile**: < 480px - Compact layout

### Typography

- Font Family: `"Segoe UI", Tahoma, Geneva, Verdana, sans-serif`
- Headings: 18px - 24px, Bold
- Body: 14px - 16px, Regular
- Labels: 12px - 14px, Medium weight

## 🔐 Authentication

### Login Flow

1. User visits admin page
2. Login dialog appears if not authenticated
3. User enters credentials:
   - Name (minimum 3 characters)
   - Email (must be @metropolia.fi)
   - Password (min 6 chars, 1 uppercase, 1 number)
4. System validates and stores auth token
5. Dashboard becomes accessible

### Session Management

- Tokens stored in `localStorage` as `adminToken`
- Login state stored as `isLoggedIn`
- Auto-logout on token expiration (401 response)
- Manual logout via user menu

## 📊 Dashboard Statistics

The dashboard displays real-time statistics calculated from backend data:

```javascript
{
  newOrders: 5,           // Orders with 'new' status
  processingOrders: 3,    // Orders with 'processing' status
  completedToday: 12,     // Completed orders
  totalCustomers: 45,     // Total registered customers
  todayMenuItems: 8,      // Items on today's menu
  todayRevenue: 234.50    // Total revenue from completed orders
}
```

## 🎯 Features in Detail

### Order Management

- **View Orders**: See all orders with details (ID, customer, items, total, status)
- **Filter Orders**: Filter by status or search by any field
- **Update Status**: Change order status with one click
- **Order Details**: View complete order information
- **Search**: Real-time search across all order fields

### Customer Management

- **View Customers**: Complete customer list from database
- **Customer Stats**: Track customer growth metrics
- **Join Dates**: See when customers registered
- **Refresh Data**: Manual refresh button with loading state

### Status Indicators

| Status     | Color  | Icon | Meaning            |
| ---------- | ------ | ---- | ------------------ |
| New        | Blue   | 📥   | Order received     |
| Processing | Orange | ⏱️   | Being prepared     |
| Completed  | Green  | ✅   | Ready for delivery |
| Cancelled  | Red    | ❌   | Order cancelled    |
| Active     | Blue   | ✓    | Active customer    |

## 🛠️ Development

### Adding New Features

1. **Add API Method** in `api-client.js`:

```javascript
async getFeatureData() {
    return this.request('/endpoint', {
        method: 'GET',
    });
}
```

2. **Create Feature Page** with:

- Same header and sidebar structure
- Include `api-client.js` and `sidebar-manager.js`
- Implement data loading in DOMContentLoaded

3. **Style with** `admin-styles.css`:

- Use CSS variables for colors
- Follow responsive design patterns
- Include loading and empty states

### Debugging

Enable console logs in `api-client.js`:

```javascript
console.log("API Request:", endpoint, options);
console.log("API Response:", response);
```

Browser DevTools:

- Network tab: Monitor API requests
- Console: Check for errors
- Application tab: Verify localStorage tokens

## 🚨 Troubleshooting

### Login Not Working

- Ensure backend is running on `http://localhost:5000`
- Check email format: `name@metropolia.fi`
- Verify password meets requirements
- Clear localStorage and refresh page

### Orders Not Loading

- Backend must be running
- Check Network tab in DevTools for API errors
- Verify CORS is enabled on backend
- Check token expiration (auto-logout on 401)

### UI Issues

- Clear browser cache (Cmd+Shift+Delete)
- Ensure all CSS files are loading
- Check console for JavaScript errors
- Try different browser

### API Errors

- Check backend logs: `npm run dev` output
- Verify database connection
- Ensure all required fields in requests
- Check database has sample data

## 📝 Best Practices

1. **Always handle loading states**
   - Show spinner while fetching data
   - Disable buttons during requests

2. **User feedback**
   - Show success messages after actions
   - Display error alerts on failures
   - Update UI immediately after changes

3. **Error handling**
   - Catch API errors gracefully
   - Show user-friendly error messages
   - Log errors to console for debugging

4. **Performance**
   - Limit displayed data (pagination in future)
   - Debounce search input
   - Cache API responses when appropriate

5. **Security**
   - Never store sensitive data in localStorage
   - Always validate user input
   - Use HTTPS in production
   - Implement rate limiting on backend

## 📱 Mobile Experience

The admin dashboard is fully responsive:

- **Sidebar**: Collapses on tablets, hides text on mobile
- **Tables**: Horizontal scroll on small screens
- **Cards**: Stack vertically on mobile
- **Navigation**: Touch-friendly buttons and spacing
- **Forms**: Full-width inputs on mobile

## 🔄 Refresh Mechanism

Each page has appropriate refresh functionality:

- **Dashboard**: Auto-loads on page visit
- **Orders**: Filter/search refreshes locally
- **Customers**: Manual refresh button available
- **Auto-refresh**: Optional periodic refresh (can be added)

## 📊 Data Flow

```
User Action (click, search, filter)
    ↓
JavaScript Handler
    ↓
API Client (api-client.js)
    ↓
Backend API
    ↓
Database
    ↓
API Response
    ↓
Update UI
    ↓
User Sees Result
```

## 🎓 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [Fetch API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
- [JavaScript async/await](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Promises)

## 📞 Support

For issues or questions:

1. Check the troubleshooting section
2. Review browser console for errors
3. Check backend logs
4. Verify all files are in correct locations
5. Ensure both backend and frontend are running

## 📄 License

Your Slice Admin Dashboard - 2025

---

**Version:** 1.0.0  
**Last Updated:** December 8, 2025  
**Status:** ✅ Production Ready
