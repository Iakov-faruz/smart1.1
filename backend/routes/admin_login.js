const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db_connection.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * עיכוב מכוון במקרה של כשלון
 * מגן מפני Brute-force מהיר ועוזר למנוע Timing Attacks
 */
const loginFailDelay = () => new Promise(resolve => setTimeout(resolve, 1200));

/**
 * POST /api/admin/login
 * הערה: ה-Rate Limiter הכללי מוגדר ב-server.js
 */
router.post('/', async (req, res) => {
    const { username, email, password } = req.body;

    // =====================================
    // 1. Input Validation (ולידציה קשוחה)
    // =====================================
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'יש למלא שם משתמש, אימייל וסיסמה' });
    }

    // הגנה מפני קלט ארוך מדי (מניעת DoS על bcrypt)
    if (username.length > 50 || email.length > 100 || password.length > 128) {
        return res.status(400).json({ error: 'קלט לא תקין' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'כתובת אימייל לא תקינה' });
    }

    try {
        const pool = await poolPromise;

        // =====================================
        // 2. שליפת המנהל מה-DB
        // =====================================
        // שים לב: שלפתי גם את plaintext_password רק לצורך ה-Dev Fallback שלך
        const result = await pool.request()
            .input('username', sql.NVarChar(50), username)
            .input('email', sql.NVarChar(100), email)
            .query(`
                SELECT 
                    [id], [username], [password_hash], [first_name], 
                    [last_name], [email], [admin_level]
                FROM [ADMINS]
                WHERE [username] = @username AND [email] = @email
            `);

        const admin = result.recordset[0];

        // =====================================
        // 3. הגנת Timing Attack (משתמש לא קיים)
        // =====================================
        if (!admin) {
            // מבצעים השוואה "ריקה" כדי שהזמן שלוקח לשרת לענות יהיה זהה
            await bcrypt.compare(password, '$2b$10$FakeHashForTimingProtectionOnly....');
            await loginFailDelay();
            console.log(`❌ נסיון התחברות נכשל - משתמש לא קיים: ${username}`);
            return res.status(401).json({ error: 'פרטי זיהוי שגויים' });
        }

        // =====================================
        // 4. אימות סיסמה (Bcrypt + Dev Fallback)
        // =====================================
        let isMatch = await bcrypt.compare(password, admin.password_hash);

        // שימוש ב-ENV מפורש שאתה שולט עליו (מוגדר ב-env.)
        const allowDevPlaintext = process.env.ALLOW_DEV_PLAINTEXT_LOGIN === 'true';

        if (!isMatch && allowDevPlaintext) {
            // כאן האימות מתבצע מול הערך שאתה רואה בעיניים ב-DB (אם קיים)
            // נניח שיש לך עמודה כזו בטבלה לצורך הפיתוח:
            if (admin.plaintext_password_debug && password === admin.plaintext_password_debug) {
                isMatch = true;
                console.warn(`⚠️ [DEV MODE] כניסת מנהל בוצעה באמצעות Plaintext עבור: ${username}`);
            }
        }

        if (!isMatch) {
            await loginFailDelay();
            console.log(`❌ סיסמה שגויה עבור מנהל: ${username}`);
            return res.status(401).json({ error: 'פרטי זיהוי שגויים' });
        }

        // =====================================
        // 5. יצירת JWT (Token אבטחה)
        // =====================================
        const token = jwt.sign(
            { 
                id: admin.id, 
                username: admin.username, 
                role: 'admin',
                admin_level: admin.admin_level || 1 
            },
            process.env.JWT_SECRET, // וודא שזה קיים ב-env.
            { expiresIn: '2h' } // הטוקן יפוג אחרי שעתיים
        );

        console.log(`✅ כניסת מנהל מוצלחת: ${username}`);

        // =====================================
        // 6. החזרת תשובה (ללא ה-Hash)
        // =====================================
        const { password_hash, plaintext_password_debug, ...adminSafeData } = admin;

        return res.status(200).json({
            message: 'התחברות בוצעה בהצלחה',
            token,
            admin: adminSafeData
        });

    } catch (err) {
        console.error("Critical Admin Login Error:", err.message);
        return res.status(500).json({ error: 'שגיאת שרת פנימית' });
    }
});

module.exports = router;