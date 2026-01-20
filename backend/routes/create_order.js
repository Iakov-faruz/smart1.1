const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db_connection.js');
const { sendOrderReceipt } = require('../services/email_service.js'); 

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
            const orderResult = await transaction.request()
                .input('customerId', sql.Int, customerId ? customerId : null) 
                .input('address', sql.NVarChar, customerInfo.address)
                .input('city', sql.NVarChar, customerInfo.city)
                .input('phone', sql.NVarChar, customerInfo.phone)
                .input('total', sql.Decimal(10, 2), totalPrice)
                .query(`
                    INSERT INTO [ORDERS] (customer_id, shipping_address, total_amount, order_date, phone, city)
                    OUTPUT INSERTED.id
                    VALUES (@customerId, @address, @total, GETDATE(), @phone, @city)
                `);

            const orderId = orderResult.recordset[0].id;

            for (const item of items) {
                await transaction.request()
                    .input('orderId', sql.Int, orderId)
                    .input('productId', sql.Int, item.id)
                    .input('qty', sql.Int, item.quantity)
                    .input('unitPrice', sql.Decimal(10, 2), item.price)
                    .query(`
                        INSERT INTO [ORDER_ITEMS] (order_id, product_id, quantity, unit_price)
                        VALUES (@orderId, @productId, @qty, @unitPrice)
                    `);

                await transaction.request()
                    .input('pId', sql.Int, item.id)
                    .input('cId', sql.Int, customerId ? customerId : null)
                    .input('qty', sql.Int, item.quantity)
                    .input('fPrice', sql.Decimal(10, 2), item.price * item.quantity)
                    .query(`
                        INSERT INTO [TRANSACTIONS] (product_id, customer_id, quantity, final_price, sale_date)
                        VALUES (@pId, @cId, @qty, @fPrice, GETDATE())
                    `);

                const updateStock = await transaction.request()
                    .input('productId', sql.Int, item.id)
                    .input('deductQty', sql.Int, item.quantity)
                    .query(`
                        UPDATE [PRODUCTS] 
                        SET stock_qty = stock_qty - @deductQty 
                        WHERE id = @productId AND stock_qty >= @deductQty
                    `);

                if (updateStock.rowsAffected[0] === 0) {
                    throw new Error(`אין מספיק מלאי עבור מוצר מזהה ${item.id}`);
                }
            }

            await transaction.commit();

            const receiptData = {
                orderId: orderId,
                items: items,
                totalAmount: totalPrice,
                customerName: customerInfo.fullName || 'לקוח'
            };

            sendOrderReceipt(customerInfo.email, receiptData)
                .then(() => console.log(`Receipt sent to ${customerInfo.email}`))
                .catch(err => console.error("Email Receipt Error:", err));

            res.status(201).json({ message: 'הזמנה בוצעה בהצלחה', orderId });

        } catch (err) {
            if (transaction) await transaction.rollback();
            throw err;
        }

    } catch (err) {
        console.error("שגיאה בביצוע הזמנה:", err.message);
        res.status(500).json({ error: err.message || 'שגיאה פנימית בשרת' });
    }
});

module.exports = router;