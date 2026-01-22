const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db_connection.js');

router.get('/categories', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT [id], [name] 
            FROM [Smartshop].[dbo].[CATEGORIES]
            ORDER BY [name] ASC
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;