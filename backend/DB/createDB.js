require('dotenv').config();
const sql = require('mssql');

// ייבוא שאילתות (וודא שהן קיימות בתיקיית tables)
const tables = {
    CATEGORIES: require('./tables/categories'),
    ADMINS: require('./tables/admins'),
    CUSTOMERS: require('./tables/customers'),
    PRODUCTS: require('./tables/products'),
    PROMOTIONS: require('./tables/promotions'),
    ORDERS: require('./tables/orders'),
    TRANSACTIONS: require('./tables/transactions'),
    ORDER_ITEMS: require('./tables/order_items')
};

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT),
    options: {
        encrypt: false,
        trustServerCertificate: true,
        database: 'master' // חיבור ראשוני ל-master
    }
};

async function setupSmartShop() {
    let pool;
    try {
        console.log("🔍 Checking environment...");
        pool = await sql.connect(config);
        const dbName = process.env.DB_DATABASE;

        // 1. בדיקה ויצירה של ה-Database
        console.log(`Checking if database [${dbName}] exists...`);
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '${dbName}')
            BEGIN
                CREATE DATABASE ${dbName};
                PRINT 'Database ${dbName} created successfully.';
            END
            ELSE
            BEGIN
                PRINT 'Database ${dbName} already exists. Skipping creation.';
            END
        `);
        await pool.close();

        // 2. התחברות ל-SmartShop ליצירת הטבלאות
        config.options.database = dbName;
        pool = await sql.connect(config);
        console.log(`--- Connected to [${dbName}] ---`);

        // 3. יצירת טבלאות (הסדר חשוב בגלל Foreign Keys!)
        // נריץ אותן אחת אחת בסדר לוגי
        const creationOrder = [
            'CATEGORIES', 'ADMINS', 'CUSTOMERS', // עצמאיות
            'PRODUCTS', 'PROMOTIONS', 'ORDERS',  // תלויות
            'TRANSACTIONS', 'ORDER_ITEMS'        // מקשרות
        ];

        for (const tableName of creationOrder) {
            console.log(`Checking table [${tableName}]...`);
            await pool.request().query(tables[tableName]);
        }

        console.log("\n✅ Setup complete. Generating schema logs...\n");

        // 4. הדפסת לוגים של מבנה הטבלאות (Metadata)
        const schemaInfo = await pool.request().query(`
            SELECT 
                t.name AS TableName,
                c.name AS ColumnName,
                type.name AS DataType,
                c.max_length AS MaxLength,
                c.is_nullable AS IsNullable
            FROM sys.tables t
            INNER JOIN sys.columns c ON t.object_id = c.object_id
            INNER JOIN sys.types type ON c.user_type_id = type.user_type_id
            WHERE t.name IN (${creationOrder.map(name => `'${name}'`).join(',')})
            ORDER BY t.name, c.column_id
        `);

        // הדפסה יפה ללוג
        console.log("--- DATABASE STRUCTURE LOGS ---");
        let currentTable = "";
        schemaInfo.recordset.forEach(row => {
            if (row.TableName !== currentTable) {
                console.log(`\n[Table: ${row.TableName}]`);
                currentTable = row.TableName;
            }
            console.log(`  - ${row.ColumnName.padEnd(15)} | ${row.DataType}(${row.MaxLength}) | Null: ${row.IsNullable}`);
        });

    } catch (err) {
        console.error("❌ Error during database setup:", err.message);
    } finally {
        if (pool) await pool.close();
        console.log("\n--- Connection Closed ---");
    }
}

setupSmartShop();