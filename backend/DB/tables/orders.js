module.exports = `
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ORDERS')
CREATE TABLE ORDERS (
    id INT PRIMARY KEY IDENTITY(1,1),
    customer_id INT FOREIGN KEY REFERENCES CUSTOMERS(id),
    shipping_address NVARCHAR(MAX),
    total_amount DECIMAL(10,2),
    order_date DATETIME DEFAULT GETDATE(),
    phone NVARCHAR(20),
    city NVARCHAR(50)
);`;