const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db_connection.js');

const isDev = process.env.NODE_ENV !== 'production';

/**
 * עדכון מלאי חכם - מותאם למבנה טבלת PRODUCTS
 */
router.put('/products/update/:id', async (req, res) => {
    const { id } = req.params;
    const { name, original_price, expiry_date, stock_qty, sku } = req.body;

    if (!expiry_date || stock_qty === undefined) {
        return res.status(400).json({ error: 'חובה לספק תאריך תפוגה וכמות מלאי' });
    }

    const finalPrice = Math.max(0, parseFloat(original_price) || 0);
    const finalQty = Math.max(0, parseInt(stock_qty) || 0);

    let transaction;

    try {
        const pool = await poolPromise;
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        const request = new sql.Request(transaction);

        request.input('id', sql.Int, id);
        request.input('sku', sql.NVarChar(50), sku || ''); 
        request.input('name', sql.NVarChar(255), name || null);
        request.input('price', sql.Decimal(10, 2), finalPrice);
        request.input('qty', sql.Int, finalQty);
        request.input('expiry', sql.Date, expiry_date);

        const query = `
            DECLARE @TargetCatID INT;
            DECLARE @TargetCatName NVARCHAR(255);
            DECLARE @TargetName NVARCHAR(255);
            DECLARE @TargetSKU NVARCHAR(50) = @sku;

            -- 1. שליפת פרטי המקור (כולל category_name שקיים אצלך בטבלה)
            SELECT TOP 1 
                @TargetCatID = [category_id], 
                @TargetCatName = [category_name],
                @TargetName = [name],
                @TargetSKU = ISNULL(NULLIF(@TargetSKU, ''), [sku])
            FROM [Smartshop].[dbo].[PRODUCTS]
            WHERE [id] = @id OR ([sku] = @TargetSKU AND @TargetSKU <> '');

            -- 2. בדיקה אם המוצר קיים
            IF @TargetCatID IS NULL
            BEGIN
                RAISERROR('המוצר לא נמצא במערכת', 16, 1);
                RETURN;
            END

            -- 3. בדיקה אם קיימת אצווה פעילה עם אותו SKU ותאריך תפוגה
            IF EXISTS (
                SELECT 1 FROM [Smartshop].[dbo].[PRODUCTS] 
                WHERE [sku] = @TargetSKU AND [expiry_date] = @expiry AND [is_active] = 1
            )
            BEGIN
                -- עדכון: הוספת מלאי לאצווה קיימת
                UPDATE [Smartshop].[dbo].[PRODUCTS]
                SET [stock_qty] = [stock_qty] + @qty,
                    [original_price] = @price,
                    [name] = ISNULL(@name, [name])
                WHERE [sku] = @TargetSKU AND [expiry_date] = @expiry AND [is_active] = 1;
            END
            ELSE
            BEGIN
                -- יצירה: הוספת אצווה חדשה עם אותה קטגוריה
                INSERT INTO [Smartshop].[dbo].[PRODUCTS] 
                    ([name], [original_price], [expiry_date], [stock_qty], [category_id], [is_active], [category_name], [sku])
                VALUES (
                    ISNULL(@name, @TargetName),
                    @price,
                    @expiry,
                    @qty,
                    @TargetCatID,
                    1,
                    @TargetCatName,
                    @TargetSKU
                );
            END
        `;

        await request.query(query);
        await transaction.commit();

        res.status(200).json({ 
            message: 'המלאי עודכן בהצלחה',
            sku: sku,
            addedQty: finalQty 
        });

    } catch (err) {
        if (transaction) await transaction.rollback();
        console.error("❌ Database Update Error:", err.message);
        res.status(500).json({ 
            error: 'שגיאה בעדכון המלאי',
            details: isDev ? err.message : null 
        });
    }
});

module.exports = router;