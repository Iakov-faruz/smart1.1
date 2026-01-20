// const express = require('express');
// const router = express.Router();
// const { sql, poolPromise } = require('../db_connection.js');

// router.post('/products/add', async (req, res) => {
//     const { products } = req.body; // מקבל מערך של מוצרים

//     if (!products || !Array.isArray(products) || products.length === 0) {
//         return res.status(400).json({ error: 'No products provided' });
//     }

//     try {
//         const pool = await poolPromise;
        
//         for (const product of products) {
//             await pool.request()
//                 .input('name', sql.NVarChar, product.name)
//                 .input('price', sql.Decimal(10, 2), product.original_price)
//                 .input('expiry', sql.Date, product.expiry_date || null)
//                 .input('stock', sql.Int, product.stock_qty)
//                 .input('catId', sql.Int, product.category_id)
//                 .input('active', sql.Bit, 1)
//                 .query(`
//                     INSERT INTO [Smartshop].[dbo].[PRODUCTS] 
//                     ([name], [original_price], [expiry_date], [stock_qty], [category_id], [is_active])
//                     VALUES (@name, @price, @expiry, @stock, @catId, @active)
//                 `);
//         }

//         res.status(201).json({ message: 'All products added successfully' });
//     } catch (err) {
//         console.error("SQL Error adding products:", err.message);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db_connection.js');

router.post('/products/add', async (req, res) => {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: 'לא התקבלו מוצרים להוספה' });
    }

    try {
        const pool = await poolPromise;
        
        for (const product of products) {
            // פתרון לשגיאת ה-NULL: אם תאריך התוקף ריק, מוזן תאריך ברירת מחדל רחוק
            const finalExpiryDate = product.expiry_date || '2099-12-31';

            await pool.request()
                .input('name', sql.NVarChar, product.name)
                .input('price', sql.Decimal(10, 2), product.original_price)
                .input('expiry', sql.Date, finalExpiryDate)
                .input('stock', sql.Int, product.stock_qty)
                .input('catId', sql.Int, product.category_id)
                .input('active', sql.Bit, 1)
                .query(`
                    INSERT INTO [Smartshop].[dbo].[PRODUCTS] 
                    ([name], [original_price], [expiry_date], [stock_qty], [category_id], [is_active])
                    VALUES (@name, @price, @expiry, @stock, @catId, @active)
                `);
        }

        res.status(201).json({ message: 'כל המוצרים נוספו בהצלחה לבסיס הנתונים' });
    } catch (err) {
        console.error("SQL Error adding products:", err.message);
        res.status(500).json({ error: 'שגיאה פנימית בשרת בעת הוספת המוצרים' });
    }
});

module.exports = router;