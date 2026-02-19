module.exports = `
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CUSTOMERS')
CREATE TABLE CUSTOMERS (
    id INT PRIMARY KEY IDENTITY(1,1),
    username NVARCHAR(50) NOT NULL UNIQUE,
    password_hash NVARCHAR(MAX) NOT NULL,
    email NVARCHAR(100),
    loyalty_points INT DEFAULT 0,
    phone NVARCHAR(20),
    city NVARCHAR(50),
    address NVARCHAR(100),
    password NVARCHAR(MAX) -- הוספתי לפי התרשים שלך למרות שיש hash
);`;