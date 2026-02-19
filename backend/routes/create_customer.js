const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db_connection.js');
const bcrypt = require('bcrypt');
const { sendWelcomeEmail } = require('../services/email_service.js');

const saltRounds = 10;
// בדיקה אם המערכת במצב פיתוח לפי ה-ENV
const isDev = process.env.NODE_ENV !== 'production';

/**
 * POST /api/create_customer
 */
router.post('/create_customer', async (req, res, next) => {
    const { username, password, email, phone, city, address } = req.body;

    // --- 1. בדיקת שדות חובה ---
    if (!username || !password || !email || !phone || !city || !address) {
        return res.status(400).json({ error: 'כל השדות חובה: שם משתמש, סיסמה, אימייל, טלפון, עיר וכתובת' });
    }

    // --- 2. הגבלת אורך קלט (מניעת התקפות הצפה/DoS) ---
    if (username.length > 50) return res.status(400).json({ error: 'שם משתמש ארוך מדי (מקסימום 50 תווים)' });
    if (email.length > 100)    return res.status(400).json({ error: 'כתובת אימייל ארוכה מדי' });
    if (password.length > 128) return res.status(400).json({ error: 'סיסמה ארוכה מדי' });

    // --- 3. וולידציה של שם משתמש (עברית, אנגלית, רווחים ומקפים) ---
    const usernameRegex = /^[a-zA-Z0-9\u05D0-\u05EA\s-]+$/;
    if (!usernameRegex.test(username)) {
        return res.status(400).json({ error: 'שם משתמש יכול להכיל אותיות, מספרים, רווחים ומקפים בלבד' });
    }

    // --- 4. וולידציה של אימייל ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'כתובת אימייל לא תקינה' });
    }

    // --- 5. וולידציה של טלפון (מספרים, מקפים ופלוס, בין 9 ל-15 תווים) ---
    const phoneRegex = /^[0-9\-\+]{9,15}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ error: 'מספר טלפון לא תקין (9-15 ספרות)' });
    }

    // --- 6. וולידציה של חוזק סיסמה ---
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{5,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ error: 'הסיסמה חייבת להכיל לפחות 5 תווים, כולל אות גדולה וקטנה באנגלית' });
    }

    try {
        const pool = await poolPromise;

        // --- 7. בדיקת כפילויות (שם משתמש או אימייל) ---
        const checkUser = await pool.request()
            .input('check_username', sql.NVarChar(50), username)
            .input('check_email', sql.NVarChar(100), email)
            .query(`
                SELECT username, email
                FROM [CUSTOMERS]
                WHERE username = @check_username OR email = @check_email
            `);

        if (checkUser.recordset.length > 0) {
            const existing = checkUser.recordset[0];
            const msg = existing.username === username
                ? 'שם המשתמש כבר תפוס'
                : 'כתובת האימייל כבר רשומה במערכת';
            return res.status(400).json({ error: msg });
        }

        // --- 8. הצפנת הסיסמה (Hashing) ---
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // --- 9. שמירה במסד הנתונים ---
        const request = pool.request()
            .input('username',      sql.NVarChar(50),  username)
            .input('password_hash', sql.NVarChar(500), hashedPassword)
            .input('email',         sql.NVarChar(100), email)
            .input('phone',         sql.NVarChar(20),  phone)
            .input('city',          sql.NVarChar(50),  city)
            .input('address',       sql.NVarChar(200), address);

        if (isDev) {
            // במצב פיתוח: שומרים גם את הסיסמה הגלויה לצורך בקרה (לוודא שהעמודה קיימת ב-DB)
            request.input('password', sql.NVarChar(128), password);
            await request.query(`
                INSERT INTO [CUSTOMERS] (username, password_hash, password, email, phone, city, address, loyalty_points)
                VALUES (@username, @password_hash, @password, @email, @phone, @city, @address, 0)
            `);
        } else {
            // במצב ייצור: אבטחה מקסימלית - רק ה-Hash נשמר
            await request.query(`
                INSERT INTO [CUSTOMERS] (username, password_hash, email, phone, city, address, loyalty_points)
                VALUES (@username, @password_hash, @email, @phone, @city, @address, 0)
            `);
        }

        // --- 10. שליחת מייל ברוך הבא ---
        // השליחה מתבצעת ברקע כדי לא לעכב את התגובה למשתמש
        sendWelcomeEmail(email, username)
            .catch(err => console.error("❌ שגיאה בשליחת מייל ברוך הבא:", err.message));

        res.status(201).json({ message: 'ההרשמה בוצעה בהצלחה! ברוכים הבאים!' });

    } catch (err) {
        console.error("Critical Register Error:", err.message);
        res.status(500).json({ error: 'שגיאה פנימית ביצירת החשבון' });
    }
});

module.exports = router;