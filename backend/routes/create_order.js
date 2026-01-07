const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db_connection.js');

router.post('/create_order', async (req, res, next) => {
    const { customerId, customerInfo, items, totalPrice } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'הסל ריק, לא ניתן לבצע הזמנה' });
    }

    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // 1. יצירת רשומת הזמנה - תמיכה ב-NULL עבור אורחים
            const orderResult = await transaction.request()
                // טיפול מפורש ב-NULL: אם customerId לא קיים, מזריקים null
                .input('customerId', sql.Int, customerId ? customerId : null) 
                .input('address', sql.NVarChar, customerInfo.address)
                .input('total', sql.Decimal(10, 2), totalPrice)
                .query(`
                    INSERT INTO [ORDERS] (customer_id, shipping_address, total_amount, order_date)
                    OUTPUT INSERTED.id
                    VALUES (@customerId, @address, @total, GETDATE())
                `);

            const orderId = orderResult.recordset[0].id;

            // 2. לולאת עדכון מוצרים, מלאי ועסקאות
            for (const item of items) {
                
                // א. פירוט הזמנה
                await transaction.request()
                    .input('orderId', sql.Int, orderId)
                    .input('productId', sql.Int, item.id)
                    .input('qty', sql.Int, item.quantity)
                    .input('unitPrice', sql.Decimal(10, 2), item.price)
                    .query(`
                        INSERT INTO [ORDER_ITEMS] (order_id, product_id, quantity, unit_price)
                        VALUES (@orderId, @productId, @qty, @unitPrice)
                    `);

                // ב. תיעוד עסקה - תמיכה ב-NULL עבור אורחים
                await transaction.request()
                    .input('pId', sql.Int, item.id)
                    .input('cId', sql.Int, customerId ? customerId : null)
                    .input('qty', sql.Int, item.quantity)
                    .input('fPrice', sql.Decimal(10, 2), item.price * item.quantity)
                    .query(`
                        INSERT INTO [TRANSACTIONS] (product_id, customer_id, quantity, final_price, sale_date)
                        VALUES (@pId, @cId, @qty, @fPrice, GETDATE())
                    `);

                // ג. עדכון מלאי
                const updateStock = await transaction.request()
                    .input('productId', sql.Int, item.id)
                    .input('deductQty', sql.Int, item.quantity)
                    .query(`
                        UPDATE [PRODUCTS] 
                        SET stock_qty = stock_qty - @deductQty 
                        WHERE id = @productId AND stock_qty >= @deductQty
                    `);

                if (updateStock.rowsAffected[0] === 0) {
                    throw new Error(`אין מספיק מלאי עבור מוצר ${item.id}`);
                }
            }

            await transaction.commit();
            res.status(201).json({ message: 'הזמנה בוצעה בהצלחה', orderId });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (err) {
        console.error("שגיאה בביצוע הזמנה:", err.message);
        res.status(500).json({ error: err.message || 'שגיאה פנימית בשרת' });
    }
});

module.exports = router;