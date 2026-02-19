require('dotenv').config();
const sql = require('mssql');
const bcrypt = require('bcrypt'); // הוספת Bcrypt להצפנת הסיסמאות ב-Seed

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT),
    options: {
        encrypt: false,
        trustServerCertificate: true,
        database: process.env.DB_DATABASE
    }
};

async function insertData() {
    let pool;
    try {
        // יצירת Hash לסיסמאות מראש (כדי למנוע עיכובים בתוך הטרנזקציה)
        const saltRounds = 10;
        const adminHash1 = await bcrypt.hash('admin123', saltRounds);
        const adminHash2 = await bcrypt.hash('manager456', saltRounds);
        
        // יצירת Hash גנרי ללקוחות (למשל הסיסמה תהיה pass123)
        const customerHash = await bcrypt.hash('pass123', saltRounds);

        pool = await sql.connect(config);
        console.log(`מתחבר למסד הנתונים ${process.env.DB_DATABASE} להכנסת נתונים מאובטחים...`);

        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const request = new sql.Request(transaction);

            console.log("מתחיל הכנסת נתונים לכל הטבלאות...");

            // 1. CATEGORIES - קטגוריות
            await request.query(`
                INSERT INTO CATEGORIES (name) VALUES 
                (N'אלקטרוניקה'), (N'מזון ומשקאות'), (N'בית וגן'), (N'צעצועים'), (N'ביגוד'),
                (N'ספורט'), (N'טיפוח ויופי'), (N'ספרים'), (N'רכב'), (N'ציוד לחיות');
            `);

            // 2. ADMINS - שימוש ב-Hash המאובטח שיצרנו למעלה
            const adminQuery = `
                INSERT INTO ADMINS (username, password_hash, first_name, last_name, email, city) VALUES 
                ('admin_super', @h1, N'אבי', N'לוי', 'avi@smartshop.com', N'תל אביב'),
                ('admin_manager', @h2, N'דנה', N'כהן', 'dana@smartshop.com', N'חיפה');
            `;
            const adminReq = new sql.Request(transaction);
            adminReq.input('h1', sql.NVarChar, adminHash1);
            adminReq.input('h2', sql.NVarChar, adminHash2);
            await adminReq.query(adminQuery);

            // 3. CUSTOMERS - 10 לקוחות עם סיסמה מוצפנת
            const customerQuery = `
                INSERT INTO CUSTOMERS (username, password_hash, email, phone, city, address) VALUES 
                ('user1', @ch, 'u1@gmail.com', '050-1112222', N'תל אביב', N'הרצל 1'),
                ('user2', @ch, 'u2@gmail.com', '050-2223333', N'ירושלים', N'יפו 50'),
                ('user3', @ch, 'u3@gmail.com', '050-3334444', N'חיפה', N'הנשיא 10'),
                ('user4', @ch, 'u4@gmail.com', '050-4445555', N'באר שבע', N'רגר 12'),
                ('user5', @ch, 'u5@gmail.com', '050-5556666', N'אשדוד', N'רוטשילד 5'),
                ('user6', @ch, 'u6@gmail.com', '050-6667777', N'נתניה', N'ביאליק 8'),
                ('user7', @ch, 'u7@gmail.com', '050-7778888', N'פתח תקווה', N'ההסתדרות 2'),
                ('user8', @ch, 'u8@gmail.com', '050-8889999', N'חולון', N'סוקולוב 14'),
                ('user9', @ch, 'u9@gmail.com', '050-9990000', N'רמת גן', N'אבא הלל 3'),
                ('user10', @ch, 'u10@gmail.com', '052-1110000', N'ראשון לציון', N'זבוטינסקי 20');
            `;
            const custReq = new sql.Request(transaction);
            custReq.input('ch', sql.NVarChar, customerHash);
            await custReq.query(customerQuery);

            // 4. PRODUCTS - מוצרים
            await request.query(`
                INSERT INTO PRODUCTS (name, original_price, stock_qty, category_id, sku) VALUES 
                (N'מחשב נייד', 3500, 50, 1, 'SKU-001'),
                (N'חלב תנובה', 6.5, 200, 2, 'SKU-002'),
                (N'מקדחה חשמלית', 450, 30, 3, 'SKU-003'),
                (N'דובי פרווה', 80, 15, 4, 'SKU-004'),
                (N'חולצת טישירט', 49.90, 100, 5, 'SKU-005'),
                (N'כדורגל מקצועי', 120, 25, 6, 'SKU-006'),
                (N'בושם יוקרתי', 299, 40, 7, 'SKU-007'),
                (N'מדריך פייתון', 150, 10, 8, 'SKU-008'),
                (N'שמן מנוע', 85, 50, 9, 'SKU-009'),
                (N'אוכל לכלבים 15 ק"ג', 199, 20, 10, 'SKU-010');
            `);

            // 5. PROMOTIONS
            await request.query(`
                INSERT INTO PROMOTIONS (name, discount_percent, created_by_admin_id) VALUES 
                (N'מבצע קיץ', 10, 1), (N'מבצע חורף', 20, 2), (N'חיסול מלאי', 50, 1),
                (N'חג שמח', 15, 2), (N'סופ"ש מטורף', 25, 1), (N'הנחת מועדון', 5, 2),
                (N'סוף עונה', 30, 1), (N'בלאק פריידי', 40, 2), (N'סייבר מאנדיי', 45, 1), (N'מבצע השקה', 12, 2);
            `);

            // 6. ORDERS
            await request.query(`
                INSERT INTO ORDERS (customer_id, total_amount, city, shipping_address) VALUES 
                (1, 3500, N'תל אביב', N'הרצל 1'), (2, 13, N'ירושלים', N'יפו 50'), (3, 450, N'חיפה', N'הנשיא 10'),
                (4, 80, N'באר שבע', N'רגר 12'), (5, 49.9, N'אשדוד', N'רוטשילד 5'), (6, 120, N'נתניה', N'ביאליק 8'),
                (7, 299, N'פתח תקווה', N'ההסתדרות 2'), (8, 150, N'חולון', N'סוקולוב 14'), (9, 85, N'רמת גן', N'אבא הלל 3'), (10, 199, N'ראשון לציון', N'זבוטינסקי 20');
            `);

            // 7. TRANSACTIONS & ORDER_ITEMS
            await request.query(`
                INSERT INTO TRANSACTIONS (product_id, customer_id, quantity, final_price) VALUES 
                (1, 1, 1, 3500), (2, 2, 2, 13), (3, 3, 1, 450), (4, 4, 1, 80), (5, 5, 1, 49.9),
                (6, 6, 1, 120), (7, 7, 1, 299), (8, 8, 1, 150), (9, 9, 1, 85), (10, 10, 1, 199);

                INSERT INTO ORDER_ITEMS (order_id, product_id, quantity, unit_price) VALUES 
                (1, 1, 1, 3500), (2, 2, 2, 6.5), (3, 3, 1, 450), (4, 4, 1, 80), (5, 5, 1, 49.9),
                (6, 6, 1, 120), (7, 7, 1, 299), (8, 8, 1, 150), (9, 9, 1, 85), (10, 10, 1, 199);
            `);

            await transaction.commit();
            console.log("✅ כל הנתונים הוכנסו בהצלחה עם סיסמאות מוצפנות!");

        } catch (err) {
            if (transaction) await transaction.rollback();
            throw err;
        }

    } catch (err) {
        console.error("❌ תקלה בהכנסת הנתונים:", err.message);
    } finally {
        if (pool) await pool.close();
    }
}

insertData();