module.exports = `
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PROMOTIONS')
CREATE TABLE PROMOTIONS (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100),
    discount_percent DECIMAL(5,2),
    start_date DATETIME,
    end_date DATETIME,
    created_by_admin_id INT FOREIGN KEY REFERENCES ADMINS(id)
);`;