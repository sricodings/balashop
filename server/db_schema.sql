CREATE DATABASE IF NOT EXISTS striker_shop;
USE striker_shop;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin'
);

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('shoe', 'slipper', 'sandal', 'other') NOT NULL,
    gender ENUM('men', 'women', 'kids', 'unisex') NOT NULL,
    size VARCHAR(10) NOT NULL,
    color VARCHAR(30),
    price_cost DECIMAL(10, 2) NOT NULL, -- Cost price for profit calc
    price_sell DECIMAL(10, 2) NOT NULL, -- Selling price
    stock_quantity INT NOT NULL DEFAULT 0,
    image_url VARCHAR(255),
    location_in_shop VARCHAR(100), -- e.g., "Rack 1, Shelf B"
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    quantity INT NOT NULL,
    sale_price DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    profit DECIMAL(10, 2) NOT NULL,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    key_name VARCHAR(50) UNIQUE NOT NULL,
    value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin if not exists
INSERT INTO users (username, password) 
SELECT * FROM (SELECT 'strikeradmin', 'bala') AS tmp
WHERE NOT EXISTS (
    SELECT username FROM users WHERE username = 'strikeradmin'
) LIMIT 1;

-- Insert default settings
INSERT IGNORE INTO settings (key_name, value) VALUES 
('email_service', 'gmail'),
('email_user', ''),
('email_pass', ''),
('daily_report_time', '23:00'),
('monthly_report_time', '07:00'),
('report_recipient', '');
