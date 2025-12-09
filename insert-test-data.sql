-- Insert test products
INSERT INTO products (name, description, price, is_vegan, image_url, category) VALUES 
('Margherita Classic', 'Fresh mozzarella, tomato sauce, basil, and olive oil on our signature dough', 12.50, false, 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400', 'pizza'),
('Vegan Supreme', 'Plant-based cheese, bell peppers, mushrooms, onions, olives, and tomato sauce', 14.90, true, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', 'pizza'),
('Pepperoni Delight', 'Spicy pepperoni, mozzarella cheese, and our classic tomato sauce', 13.80, false, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400', 'pizza'),
('Mediterranean Veggie', 'Feta cheese, sun-dried tomatoes, olives, spinach, and herbs', 13.20, false, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', 'pizza'),
('BBQ Chicken Special', 'Grilled chicken, BBQ sauce, red onions, cilantro, and mozzarella', 15.50, false, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400', 'pizza')
ON CONFLICT DO NOTHING;

-- Add today's menu items
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

-- Insert test user
INSERT INTO users (first_name, last_name, email, password_hash, age, is_admin) 
VALUES ('Test', 'User', 'test@example.com', '$2b$10$rQQ7gF8J9fJ5J5J5J5J5JeJ5J5J5J5J5J5J5J5J5J5J5J5J5J5J5J5', 25, false)
ON CONFLICT (email) DO NOTHING;
