-- Database schema for Your Slice pizza restaurant

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    age INTEGER CHECK (age >= 16 AND age <= 120),
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table for menu items
CREATE TABLE IF NOT EXISTS products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    is_vegan BOOLEAN DEFAULT false,
    image_url VARCHAR(500),
    category VARCHAR(100) DEFAULT 'pizza',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create daily_menu table to track which products are available on which days
CREATE TABLE IF NOT EXISTS daily_menu (
    menu_id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
    menu_date DATE NOT NULL,
    special_price DECIMAL(10,2), -- Optional special pricing for the day
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, menu_date)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    order_status VARCHAR(50) DEFAULT 'pending',
    delivery_address TEXT,
    phone_number VARCHAR(20),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estimated_delivery TIMESTAMP
);

-- Create order_items table for order details
CREATE TABLE IF NOT EXISTS order_items (
    item_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(product_id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    item_total DECIMAL(10,2) NOT NULL
);

-- Insert sample admin user (password: Admin123)
INSERT INTO users (first_name, last_name, email, password_hash, age, is_admin) 
VALUES ('Admin', 'User', 'admin@yourslice.fi', '$2b$10$rQQ7gF8J9fJ5J5J5J5J5JeJ5J5J5J5J5J5J5J5J5J5J5J5J5J5J5J5', 30, true)
ON CONFLICT (email) DO NOTHING;

-- Insert sample products for today's menu
INSERT INTO products (name, description, price, is_vegan, image_url, category) VALUES 
('Margherita Classic', 'Fresh mozzarella, tomato sauce, basil, and olive oil on our signature dough', 12.50, false, 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400', 'pizza'),
('Vegan Supreme', 'Plant-based cheese, bell peppers, mushrooms, onions, olives, and tomato sauce', 14.90, true, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', 'pizza'),
('Pepperoni Delight', 'Spicy pepperoni, mozzarella cheese, and our classic tomato sauce', 13.80, false, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400', 'pizza'),
('Mediterranean Veggie', 'Feta cheese, sun-dried tomatoes, olives, spinach, and herbs', 13.20, false, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', 'pizza'),
('BBQ Chicken Special', 'Grilled chicken, BBQ sauce, red onions, cilantro, and mozzarella', 15.50, false, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400', 'pizza')
ON CONFLICT DO NOTHING;

-- Add today's menu items (using current date)
INSERT INTO daily_menu (product_id, menu_date, special_price, is_available) 
SELECT 
    product_id, 
    CURRENT_DATE, 
    CASE 
        WHEN name = 'Margherita Classic' THEN 10.90 
        WHEN name = 'Vegan Supreme' THEN 12.90 
        ELSE NULL 
    END,
    true
FROM products 
WHERE name IN ('Margherita Classic', 'Vegan Supreme', 'Pepperoni Delight', 'Mediterranean Veggie')
ON CONFLICT (product_id, menu_date) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_menu_date ON daily_menu(menu_date);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
