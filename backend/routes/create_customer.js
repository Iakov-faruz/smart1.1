// const express = require('express');
// const router = express.Router();
// const { sql, poolPromise } = require('../db_connection.js');

// router.post('/create_customer', async (req, res, next) => {
//     // שליפת כל השדות החדשים מה-body
//     const { username, password_hash, email, phone, city, address } = req.body;

//     // 1. וולידציה בסיסית - האם כל השדות החיוניים קיימים
//     if (!username || !password_hash || !email || !phone || !city || !address) {
//         return res.status(400).json({ error: 'כל השדות (שם משתמש, סיסמה, אימייל, טלפון, עיר וכתובת) הם חובה' });
//     }

//     // 2. בדיקת שם משתמש - תמיכה בעברית, אנגלית ומספרים בלבד
//     const usernameRegex = /^[a-zA-Z0-9א-ת\s]+$/; // הוספתי \s למקרה שיש רווח בשם
//     if (!usernameRegex.test(username)) {
//         return res.status(400).json({ error: 'שם משתמש יכול להכיל אותיות (עברית/אנגלית) ומספרים בלבד' });
//     }

//     // 3. בדיקת סיסמה - לפחות 5 תווים, אות גדולה ואות קטנה (באנגלית)
//     const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{5,}$/;
//     if (!passwordRegex.test(password_hash)) {
//         return res.status(400).json({ error: 'הסיסמה חייבת לכלול לפחות 5 תווים, אות גדולה ואות קטנה באנגלית' });
//     }

//     try {
//         const pool = await poolPromise;

//         // 4. בדיקה נגד כפילויות (מייל או שם משתמש)
//         const checkUser = await pool.request()
//             .input('check_username', sql.NVarChar, username)
//             .input('check_email', sql.NVarChar, email)
//             .query(`
//                 SELECT username, email 
//                 FROM [CUSTOMERS] 
//                 WHERE username = @check_username OR email = @check_email
//             `);

//         if (checkUser.recordset.length > 0) {
//             const existingUser = checkUser.recordset[0];
//             const errorMsg = existingUser.username === username ? 'שם המשתמש כבר תפוס' : 'כתובת האימייל כבר רשומה';
//             return res.status(400).json({ error: errorMsg });
//         }

//         // 5. יצירת הלקוח - הוספת השדות החדשים לשאילתה
//         await pool.request()
//             .input('username', sql.NVarChar, username)
//             .input('password_hash', sql.NVarChar, password_hash)
//             .input('email', sql.NVarChar, email)
//             .input('phone', sql.NVarChar, phone)
//             .input('city', sql.NVarChar, city)
//             .input('address', sql.NVarChar, address)
//             .query(`
//                 INSERT INTO [CUSTOMERS] (username, password_hash, email, phone, city, address, loyalty_points) 
//                 VALUES (@username, @password_hash, @email, @phone, @city, @address, 0)
//             `);

//         res.status(201).json({ message: 'החשבון נוצר בהצלחה!' });
//     } catch (err) {
//         console.error("Error creating customer:", err);
//         next(err); 
//     }
// });

// module.exports = router;
const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db_connection.js');
const { sendWelcomeEmail } = require('../services/email_service.js'); // ייבוא שירות האימייל המופרד

router.post('/create_customer', async (req, res, next) => {
    const { username, password_hash, email, phone, city, address } = req.body;

    if (!username || !password_hash || !email || !phone || !city || !address) {
        return res.status(400).json({ error: 'כל השדות הם חובה' });
    }

    const usernameRegex = /^[a-zA-Z0-9א-ת\s]+$/; 
    if (!usernameRegex.test(username)) {
        return res.status(400).json({ error: 'שם משתמש יכול להכיל אותיות ומספרים בלבד' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{5,}$/;
    if (!passwordRegex.test(password_hash)) {
        return res.status(400).json({ error: 'הסיסמה חייבת לכלול לפחות 5 תווים, אות גדולה וקטנה' });
    }

    try {
        const pool = await poolPromise;

        const checkUser = await pool.request()
            .input('check_username', sql.NVarChar, username)
            .input('check_email', sql.NVarChar, email)
            .query(`
                SELECT username, email 
                FROM [CUSTOMERS] 
                WHERE username = @check_username OR email = @check_email
            `);

        if (checkUser.recordset.length > 0) {
            const existingUser = checkUser.recordset[0];
            const errorMsg = existingUser.username === username ? 'שם המשתמש כבר תפוס' : 'כתובת האימייל כבר רשומה';
            return res.status(400).json({ error: errorMsg });
        }

        await pool.request()
            .input('username', sql.NVarChar, username)
            .input('password_hash', sql.NVarChar, password_hash)
            .input('email', sql.NVarChar, email)
            .input('phone', sql.NVarChar, phone)
            .input('city', sql.NVarChar, city)
            .input('address', sql.NVarChar, address)
            .query(`
                INSERT INTO [CUSTOMERS] (username, password_hash, email, phone, city, address, loyalty_points) 
                VALUES (@username, @password_hash, @email, @phone, @city, @address, 0)
            `);

        // --- שליחת מייל ברוך הבא ---
        sendWelcomeEmail(email, username)
            .then(() => console.log(`Welcome email sent to: ${email}`))
            .catch(err => console.error("Email service error:", err));

        res.status(201).json({ message: 'החשבון נוצר בהצלחה!' });
    } catch (err) {
        console.error("Error creating customer:", err);
        next(err);
    }
});

module.exports = router;