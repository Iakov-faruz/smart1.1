const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db_connection');

router.get('/products', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT * FROM PRODUCTS WHERE is_active = 1 ORDER BY name ASC');
        
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send({ error: 'שגיאה בשליפת מוצרים' });
    }
});

module.exports = router;