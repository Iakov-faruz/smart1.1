const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db_connection.js');
// ייבוא ה-Middleware שבודק אם המשתמש הוא מנהל מחובר
const { verifyAdmin } = require('../middleware/auth_JWT');


/**
 * הוספת מוצרים/אצוות חדשות למלאי
 * מוגן ע"י verifyAdmin - רק משתמש עם טוקן תקף יכול לגשת
 */
router.post('/products/add', verifyAdmin, async (req, res) => {
    const { products } = req.body;

    // וולידציה: בדיקה שהתקבל מערך מוצרים לא ריק
    if (!products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: 'לא התקבלו מוצרים להוספה' });
    }

    try {
        const pool = await poolPromise;
        
        // מעבר על כל מוצר במערך שנשלח מהפרונטנד
        for (const product of products) {
            // ברירת מחדל לתאריך רחוק אם לא צוין תאריך תפוגה
            const finalExpiryDate = product.expiry_date || '2099-12-31';

            await pool.request()
                .input('sku', sql.NVarChar(50), product.sku)
                .input('name', sql.NVarChar(255), product.name)
                .input('price', sql.Decimal(10, 2), product.original_price)
                .input('expiry', sql.Date, finalExpiryDate)
                .input('stock', sql.Int, product.stock_qty)
                .input('catId', sql.Int, product.category_id)
                .input('active', sql.Bit, 1)
                .query(`
                    IF EXISTS (SELECT 1 FROM [Smartshop].[dbo].[PRODUCTS] WHERE [sku] = @sku AND [expiry_date] = @expiry)
                    BEGIN
                        -- אם קיים מוצר עם אותו SKU ואותו תאריך תפוגה, מעדכנים כמות ומחיר
                        UPDATE [Smartshop].[dbo].[PRODUCTS]
                        SET [stock_qty] = [stock_qty] + @stock,
                            [original_price] = @price
                        WHERE [sku] = @sku AND [expiry_date] = @expiry
                    END
                    ELSE
                    BEGIN
                        -- אם ה-SKU לא קיים או שתאריך התפוגה שונה (אצווה חדשה), יוצרים שורה חדשה
                        INSERT INTO [Smartshop].[dbo].[PRODUCTS] 
                        ([sku], [name], [original_price], [expiry_date], [stock_qty], [category_id], [is_active])
                        VALUES (@sku, @name, @price, @expiry, @stock, @catId, @active)
                    END
                `);
        }

        res.status(201).json({ message: 'המלאי עודכן בהצלחה' });

    } catch (err) {
        console.error("SQL Error adding products:", err.message);
        res.status(500).json({ 
            error: 'שגיאה פנימית בשרת בעת עדכון המלאי',
            details: err.message 
        });
    }
});

module.exports = router;