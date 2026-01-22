const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db_connection.js');

router.put('/products/update/:id', async (req, res) => {
    const { id } = req.params;
    // שים לב: הורדנו את category_id מה-body, השרת יטפל בזה לבד
    const { name, original_price, expiry_date, stock_qty, sku } = req.body;

    try {
        const pool = await poolPromise;
        
        // המרה בטוחה למספרים למניעת NaN
        const finalPrice = isNaN(parseFloat(original_price)) ? 0 : parseFloat(original_price);
        const finalQty = isNaN(parseInt(stock_qty)) ? 0 : parseInt(stock_qty);
        const safeName = name ? name.replace(/'/g, "''") : null;

        await pool.request().query(`
            -- 1. שליפת הקטגוריה והשם המקוריים מהמוצר הקיים
            DECLARE @OriginalCatID INT;
            DECLARE @OriginalName NVARCHAR(255);

            SELECT TOP 1 @OriginalCatID = [category_id], @OriginalName = [name]
            FROM [Smartshop].[dbo].[PRODUCTS]
            WHERE [id] = ${id} OR [sku] = '${sku}';

            -- 2. בדיקה אם קיימת כבר אצווה עם אותו SKU ותאריך תפוגה
            IF EXISTS (SELECT 1 FROM [Smartshop].[dbo].[PRODUCTS] WHERE [sku] = '${sku}' AND [expiry_date] = '${expiry_date}')
            BEGIN
                -- עדכון אצווה קיימת (הוספת מלאי ועדכון מחיר/שם)
                UPDATE [Smartshop].[dbo].[PRODUCTS]
                SET [stock_qty] = [stock_qty] + ${finalQty},
                    [original_price] = ${finalPrice},
                    [name] = ISNULL(N'${safeName}', [name])
                WHERE [sku] = '${sku}' AND [expiry_date] = '${expiry_date}'
            END
            ELSE
            BEGIN
                -- יצירת אצווה חדשה (שורה חדשה) עם הקטגוריה המקורית ששלפנו
                INSERT INTO [Smartshop].[dbo].[PRODUCTS] 
                ([sku], [name], [original_price], [expiry_date], [stock_qty], [category_id], [is_active])
                VALUES (
                    '${sku}', 
                    ISNULL(N'${safeName}', @OriginalName), 
                    ${finalPrice}, 
                    '${expiry_date}', 
                    ${finalQty}, 
                    @OriginalCatID, -- שימוש בקטגוריה המקורית מה-DB
                    1
                )
            END
        `);
        
        res.json({ message: 'המלאי עודכן בהצלחה' });
    } catch (err) {
        console.error("SQL Error:", err.message);
        res.status(500).json({ error: 'שגיאה במסד הנתונים', details: err.message });
    }
});

module.exports = router;