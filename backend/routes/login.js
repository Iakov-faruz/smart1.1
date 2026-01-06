const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db_connection.js'); // וודא שהנתיב לקובץ ה-DB נכון

router.post('/login', async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'נא להזין שם משתמש וסיסמה' });
    }

    try {
        const pool = await poolPromise;
        
        // שליפת המשתמש לפי שם משתמש
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query(`
                SELECT [id], [username], [password_hash], [email], [loyalty_points]
                FROM [CUSTOMERS]
                WHERE [username] = @username
            `);

        const user = result.recordset[0];

        // 1. בדיקה אם המשתמש קיים
        if (!user) {
            return res.status(401).json({ error: 'שם משתמש או סיסמה שגויים' });
        }

        // 2. בדיקת סיסמה 
        // הערה: אם השתמשת ב-bcrypt ב-SignUp, צריך להשתמש ב-bcrypt.compare כאן.
        // כרגע אני משווה טקסט פשוט כפי שביקשת במבנה הבסיסי:
        if (user.password_hash !== password) {
            return res.status(401).json({ error: 'שם משתמש או סיסמה שגויים' });
        }

        // 3. הצלחה - החזרת פרטי המשתמש (ללא הסיסמה מטעמי אבטחה)
        const { password_hash, ...userWithoutPassword } = user;
        
        res.status(200).json({
            message: 'התחברת בהצלחה',
            user: userWithoutPassword
        });

    } catch (err) {
        next(err);
    }
});

module.exports = router;