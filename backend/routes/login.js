const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db_connection.js');

router.post('/login', async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'נא להזין שם משתמש וסיסמה' });
    }

    try {
        const pool = await poolPromise;
        
        // --- עדכון השאילתה: הוספת השדות החדשים לשליפה ---
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query(`
                SELECT [id], [username], [password_hash], [email], [loyalty_points], [phone], [city], [address]
                FROM [CUSTOMERS]
                WHERE [username] = @username
            `);

        const user = result.recordset[0];

        // 1. בדיקה אם המשתמש קיים
        if (!user) {
            return res.status(401).json({ error: 'שם משתמש או סיסמה שגויים' });
        }

        // 2. בדיקת סיסמה (השוואה ישירה כפי שהגדרת)
        if (user.password_hash !== password) {
            return res.status(401).json({ error: 'שם משתמש או סיסמה שגויים' });
        }

        // 3. הצלחה - החזרת פרטי המשתמש המלאים (ללא הסיסמה)
        const { password_hash, ...userWithoutPassword } = user;
        
        res.status(200).json({
            message: 'התחברת בהצלחה',
            user: userWithoutPassword
        });

    } catch (err) {
        console.error("Login Error:", err.message);
        next(err);
    }
});

module.exports = router;