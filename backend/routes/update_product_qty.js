const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db_connection.js');

// עדכון כמות מלאי למוצר
router.put('/products/update-qty', async (req, res) => {
    const { productId, newQty } = req.body;

    // בדיקת תקינות נתונים בסיסית
    if (productId === undefined || newQty === undefined) {
        return res.status(400).json({ error: 'Missing product ID or new quantity' });
    }

    if (newQty < 0) {
        return res.status(400).json({ error: 'Stock quantity cannot be negative' });
    }

    try {
        const pool = await poolPromise;
        
        // ביצוע העדכון בטבלה
        const result = await pool.request()
            .input('id', sql.Int, productId)
            .input('qty', sql.Int, newQty)
            .query(`
                UPDATE [Smartshop].[dbo].[PRODUCTS]
                SET [stock_qty] = @qty
                WHERE [id] = @id
            `);

        // בדיקה אם השורה אכן נמצאה ועודכנה
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        console.log(`Product ${productId} stock updated to ${newQty}`);
        
        res.status(200).json({ 
            message: 'Stock updated successfully',
            productId,
            newQty 
        });

    } catch (err) {
        console.error("SQL Error updating stock:", err.message);
        res.status(500).json({ error: 'Internal server error while updating stock' });
    }
});

module.exports = router;