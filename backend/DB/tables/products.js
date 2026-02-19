module.exports = `
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PRODUCTS')
CREATE TABLE PRODUCTS (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL,
    original_price DECIMAL(10,2),
    expiry_date DATE,
    stock_qty INT DEFAULT 0,
    category_id INT FOREIGN KEY REFERENCES CATEGORIES(id),
    is_active BIT DEFAULT 1,
    category_name NVARCHAR(100),
    sku NVARCHAR(50)
);`;