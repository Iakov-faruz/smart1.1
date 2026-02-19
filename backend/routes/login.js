const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db_connection.js');
const bcrypt = require('bcrypt');

router.post('/login', async (req, res) => {
    const { username, password } = req.body; // מקבל username מהפרונט

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const pool = await poolPromise;
        // שאילתה לפי עמודת username
        const result = await pool.request()
            .input('username', sql.NVarChar(100), username)
            .query('SELECT * FROM [Smartshop].[dbo].[CUSTOMERS] WHERE username = @username');

        if (result.recordset.length === 0) {
            console.warn(`[Login Attempt] Failed: Username not found (${username})`);
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const user = result.recordset[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const { password_hash, password: plainPass, ...userProfile } = user;
        res.status(200).json({ message: 'Login successful', user: userProfile });

    } catch (err) {
        console.error('[Database Error] Login failed:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;