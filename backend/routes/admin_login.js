const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db_connection.js');

router.post('/admin/login', async (req, res, next) => {
    console.log("--- Admin Login Attempt (Plain Text) ---");
    const { username, email, password } = req.body;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .input('email', sql.NVarChar, email)
            .query(`
                SELECT [id], [username], [password_hash], [first_name], [last_name], [email]
                FROM [ADMINS]
                WHERE [username] = @username AND [email] = @email
            `);

        const admin = result.recordset[0];

        if (!admin) {
            console.log("Failure: Admin not found");
            return res.status(401).json({ error: 'Invalid admin credentials' });
        }

        // השוואה ישירה של טקסט (ללא Bcrypt)
        if (admin.password_hash !== password) {
            console.log("Failure: Password mismatch");
            console.log("Expected:", admin.password_hash, "Received:", password);
            return res.status(401).json({ error: 'Invalid admin credentials' });
        }

        console.log("Success: Admin authenticated!");
        const { password_hash, ...adminData } = admin;
        res.status(200).json({ admin: adminData });

    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;