module.exports = `
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ORDER_ITEMS')
CREATE TABLE ORDER_ITEMS (
    id INT PRIMARY KEY IDENTITY(1,1),
    order_id INT FOREIGN KEY REFERENCES ORDERS(id),
    product_id INT FOREIGN KEY REFERENCES PRODUCTS(id),
    quantity INT,
    unit_price DECIMAL(10,2)
);`;