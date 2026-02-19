module.exports = `
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ADMINS')
CREATE TABLE ADMINS (
    id INT PRIMARY KEY IDENTITY(1,1),
    username NVARCHAR(50) NOT NULL UNIQUE,
    password_hash NVARCHAR(MAX) NOT NULL,
    admin_level INT DEFAULT 1,
    first_name NVARCHAR(50),
    last_name NVARCHAR(50),
    city NVARCHAR(50),
    address NVARCHAR(100),
    email NVARCHAR(100)
);`;