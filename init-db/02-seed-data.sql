-- Seed Data for Hasura Demo

-- ============================================
-- USERS
-- ============================================
INSERT INTO users (id, email, name, role) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'admin@example.com', 'Admin User', 'admin'),
    ('550e8400-e29b-41d4-a716-446655440002', 'manager@example.com', 'Store Manager', 'manager'),
    ('550e8400-e29b-41d4-a716-446655440003', 'alice@example.com', 'Alice Johnson', 'customer'),
    ('550e8400-e29b-41d4-a716-446655440004', 'bob@example.com', 'Bob Smith', 'customer'),
    ('550e8400-e29b-41d4-a716-446655440005', 'charlie@example.com', 'Charlie Brown', 'customer');

-- ============================================
-- CATEGORIES
-- ============================================
INSERT INTO categories (id, name, description, parent_id) VALUES
    (1, 'Electronics', 'Electronic devices and accessories', NULL),
    (2, 'Computers', 'Desktop and laptop computers', 1),
    (3, 'Smartphones', 'Mobile phones and accessories', 1),
    (4, 'Clothing', 'Apparel and fashion items', NULL),
    (5, 'Men''s Wear', 'Clothing for men', 4),
    (6, 'Women''s Wear', 'Clothing for women', 4),
    (7, 'Books', 'Physical and digital books', NULL),
    (8, 'Programming', 'Programming and tech books', 7);

SELECT setval('categories_id_seq', 8);

-- ============================================
-- PRODUCTS
-- ============================================
INSERT INTO products (id, name, description, price, stock_quantity, category_id, metadata) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', 'MacBook Pro 16"', 'Apple MacBook Pro with M3 chip', 2499.00, 50, 2,
     '{"brand": "Apple", "specs": {"ram": "32GB", "storage": "1TB SSD", "chip": "M3 Pro"}}'),
    ('660e8400-e29b-41d4-a716-446655440002', 'ThinkPad X1 Carbon', 'Lenovo business laptop', 1799.00, 30, 2,
     '{"brand": "Lenovo", "specs": {"ram": "16GB", "storage": "512GB SSD", "processor": "Intel i7"}}'),
    ('660e8400-e29b-41d4-a716-446655440003', 'iPhone 15 Pro', 'Apple flagship smartphone', 1199.00, 100, 3,
     '{"brand": "Apple", "specs": {"storage": "256GB", "color": "Natural Titanium"}}'),
    ('660e8400-e29b-41d4-a716-446655440004', 'Samsung Galaxy S24', 'Samsung flagship with AI features', 999.00, 80, 3,
     '{"brand": "Samsung", "specs": {"storage": "256GB", "color": "Phantom Black"}}'),
    ('660e8400-e29b-41d4-a716-446655440005', 'Classic Denim Jacket', 'Timeless denim jacket for any occasion', 89.99, 200, 5,
     '{"brand": "Levi''s", "sizes": ["S", "M", "L", "XL"], "material": "100% Cotton Denim"}'),
    ('660e8400-e29b-41d4-a716-446655440006', 'Summer Floral Dress', 'Light and breezy summer dress', 59.99, 150, 6,
     '{"brand": "Zara", "sizes": ["XS", "S", "M", "L"], "material": "Polyester blend"}'),
    ('660e8400-e29b-41d4-a716-446655440007', 'Clean Code', 'A Handbook of Agile Software Craftsmanship', 44.99, 500, 8,
     '{"author": "Robert C. Martin", "pages": 464, "isbn": "978-0132350884"}'),
    ('660e8400-e29b-41d4-a716-446655440008', 'The Pragmatic Programmer', 'Your Journey to Mastery, 20th Anniversary Edition', 49.99, 300, 8,
     '{"author": "David Thomas, Andrew Hunt", "pages": 352, "isbn": "978-0135957059"}');

-- ============================================
-- ORDERS
-- ============================================
INSERT INTO orders (id, user_id, status, total_amount, shipping_address, notes) VALUES
    ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'delivered', 2588.99,
     '{"street": "123 Main St", "city": "San Francisco", "state": "CA", "zip": "94102"}',
     'Please leave at the door'),
    ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'processing', 1199.00,
     '{"street": "456 Oak Ave", "city": "New York", "state": "NY", "zip": "10001"}',
     NULL),
    ('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 'pending', 94.98,
     '{"street": "789 Pine Rd", "city": "Seattle", "state": "WA", "zip": "98101"}',
     'Gift wrap please');

-- ============================================
-- ORDER ITEMS
-- ============================================
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
    ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 1, 2499.00),
    ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440005', 1, 89.99),
    ('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', 1, 1199.00),
    ('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440007', 1, 44.99),
    ('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440008', 1, 49.99);

-- ============================================
-- REVIEWS
-- ============================================
INSERT INTO reviews (user_id, product_id, rating, comment) VALUES
    ('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 5, 'Amazing laptop! The M3 chip is incredibly fast.'),
    ('550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 4, 'Great performance but a bit pricey.'),
    ('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440007', 5, 'Must-read for every developer!'),
    ('550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440008', 5, 'Changed the way I think about programming.'),
    ('550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440003', 4, 'Great phone, excellent camera quality.');
