const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db_connection');

router.get('/categories-with-products', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                P.id AS ProductID, 
                C.name AS CategoryName, 
                P.name AS ProductName, 
                P.original_price, 
                P.stock_qty,
                P.expiry_date,
                P.sku -- הוספנו SKU כדי לעזור בזיהוי מוצרים זהים
            FROM CATEGORIES C
            LEFT JOIN PRODUCTS P ON C.id = P.category_id
            WHERE P.is_active = 1 OR P.is_active IS NULL
            ORDER BY P.name ASC 
        `);

        const now = new Date();
        now.setHours(0, 0, 0, 0); 

        // שלב 1: חישוב הנחות לכל שורה בנפרד
        let processedRows = result.recordset.map(product => {
            if (!product.ProductID || !product.expiry_date) {
                return { ...product, discountPercent: 0, finalPrice: product.original_price };
            }

            const expiry = new Date(product.expiry_date);
            expiry.setHours(0, 0, 0, 0);
            const diffTime = expiry - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let discountPercent = 0;
            if (diffDays === 0) discountPercent = 45; 
            else if (diffDays === 1 || diffDays === 2) discountPercent = 30; 
            else if (diffDays === 3) discountPercent = 10; 

            const originalPrice = parseFloat(product.original_price);
            const finalPrice = discountPercent > 0 
                ? (originalPrice * (1 - discountPercent / 100)).toFixed(2) 
                : originalPrice.toFixed(2);

            return {
                ...product,
                name: product.ProductName,
                discountPercent: discountPercent,
                finalPrice: parseFloat(finalPrice),
                daysToExpiry: diffDays
            };
        });

        // שלב 2: סינון מוצרים עם מלאי 0 שתוקפם קצר
        let filteredRows = processedRows.filter(p => !(p.discountPercent > 0 && p.stock_qty <= 0));

        // שלב 3: איחוד מוצרים רגילים (ללא הנחה) לכרטיס אחד
        const groupedProducts = [];
        const regularProductsMap = new Map(); // מפה לשמירת מוצרים רגילים שכבר ראינו

        filteredRows.forEach(product => {
            // אם המוצר הוא תוקף קצר (יש הנחה) - הוסף אותו כפי שהוא
            if (product.discountPercent > 0) {
                groupedProducts.push(product);
            } else {
                // מוצר רגיל - נבדוק אם כבר קיים במפה לפי השם והקטגוריה
                const key = `${product.ProductName}_${product.CategoryName}`;
                
                if (regularProductsMap.has(key)) {
                    // אם קיים, רק נוסיף למלאי שלו
                    const existingProduct = regularProductsMap.get(key);
                    existingProduct.stock_qty += product.stock_qty;
                } else {
                    // אם לא קיים, נוסיף למפה וגם למערך התוצאה
                    const newProduct = { ...product };
                    regularProductsMap.set(key, newProduct);
                    groupedProducts.push(newProduct);
                }
            }
        });

        res.json(groupedProducts);
    } catch (err) {
        console.error("Error in categories-with-products:", err.message);
        res.status(500).send({ error: 'שגיאה בשליפת קטגוריות ומוצרים' });
    }
});

module.exports = router;