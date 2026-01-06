const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db_connection');

router.get('/categories-with-products', async (req, res) => {
    try {
        const pool = await poolPromise;
        // הוספתי את P.id כ-ProductID כדי שיהיה לנו מזהה ייחודי
        const result = await pool.request().query(`
            SELECT 
                P.id AS ProductID, 
                C.name AS CategoryName, 
                P.name AS ProductName, 
                P.original_price, 
                P.stock_qty
            FROM CATEGORIES C
            LEFT JOIN PRODUCTS P ON C.id = P.category_id
            WHERE P.is_active = 1 OR P.is_active IS NULL
        `);
        
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'שגיאה בשליפת קטגוריות ומוצרים' });
    }
});

module.exports = router;