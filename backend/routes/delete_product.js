const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db_connection.js');

router.delete('/products/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const pool = await poolPromise;
        // מחיקה לוגית - עדכון סטטוס במקום מחיקת השורה
        const result = await pool.request()
            .input('id', sql.Int, productId)
            .query('UPDATE [PRODUCTS] SET [is_active] = 0 WHERE [id] = @id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'המוצר לא נמצא' });
        }

        res.status(200).json({ message: 'המוצר הוסר מהתצוגה בהצלחה' });
    } catch (err) {
        console.error("SQL Error:", err.message);
        res.status(500).json({ error: 'שגיאה בשרת בעת הסרת המוצר' });
    }
});

module.exports = router;