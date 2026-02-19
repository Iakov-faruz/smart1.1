const express = require('express');
const cors = require('cors');
require('dotenv').config();
const rateLimit = require('express-rate-limit');

// ייבוא ה-Middleware לאימות טוקן (JWT) - מוודא שהמשתמש הוא אכן מנהל
const { verifyAdmin } = require('./middleware/auth_JWT');

const app = express();
const PORT = process.env.PORT || 5000;

// בדיקה האם אנחנו בסביבת פיתוח
const isDev = process.env.NODE_ENV !== 'production';

// --- 1. הגדרות CORS ---
// מאפשר ל-Frontend לתקשר עם השרת ושומר על אבטחה
app.use(cors({
    origin: isDev ? 'http://localhost:5173' : process.env.FRONTEND_URL,
    credentials: true // מאפשר העברת עוגיות וטוקנים במידת הצורך
}));

app.use(express.json()); // מאפשר לשרת לקרוא קבצי JSON שנשלחים ב-Body

// --- 2. Rate Limiter (הגנה מפני הצפת בקשות) ---
// מגן על נתיבי ההתחברות מפני ניסיונות פיצוח סיסמה (Brute Force)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // חלון זמן של 15 דקות
    max: isDev ? 50 : 5,      // בפיתוח נאפשר יותר ניסיונות כדי שלא תיחסם בטעות
    message: { error: 'יותר מדי ניסיונות התחברות. נא להמתין 15 דקות' },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { ip: false },  // פותר בעיות חיבור IPv6 ב-Localhost
});

// --- 3. ייבוא ה-Routes (נתיבי המערכת) ---
const productRoutes              = require('./routes/get_all_products');
const category_with_products_Routes = require('./routes/get_all_category_with_products');
const customerRoutes             = require('./routes/create_customer');
const loginRoutes                = require('./routes/login');
const createOrderRoute           = require('./routes/create_order');
const adminLoginRoute            = require('./routes/admin_login');
const updateStockRouter          = require('./routes/update_product_qty');
const addProductRouter           = require('./routes/add_product');
const categoryRoutes             = require('./routes/get_categories');
const deleteProductRouter        = require('./routes/delete_product');
const updateProductByIdRouter    = require('./routes/update_product_by_id');

// --- 4. נתיבי התחברות (עם הגנת Rate Limit) ---
app.use('/api/login', loginLimiter, loginRoutes);
app.use('/api/admin/login', loginLimiter, adminLoginRoute);

// --- 5. נתיבים ציבוריים (נגישים לכולם ללא הזדהות) ---
app.use('/api', productRoutes);
app.use('/api', category_with_products_Routes);
app.use('/api', customerRoutes);
app.use('/api', categoryRoutes);
app.use('/api', createOrderRoute);

// --- 6. נתיבים מוגנים (דורשים טוקן מנהל בתוקף - verifyAdmin) ---
// ה-Middleware בודק את ה-JWT לפני שהבקשה מגיעה ל-Route עצמו
app.use('/api', verifyAdmin, [
    addProductRouter,
    deleteProductRouter,
    updateProductByIdRouter,
    updateStockRouter
]);

// --- 7. טיפול בנתיבים לא קיימים (404) ---
app.use((req, res) => {
    res.status(404).json({ error: 'הכתובת המבוקשת לא קיימת בשרת' });
});

// --- 8. טיפול גלובלי בשגיאות (Global Error Handler) ---
// מונע קריסה של השרת ושולח הודעה מסודרת ללקוח
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err.message);
    
    // שליחת ה-Stack (פירוט השגיאה) רק במצב פיתוח כדי לא לחשוף מידע לתוקפים
    if (isDev) {
        console.error(err.stack);
    }

    res.status(500).json({ 
        error: 'שגיאת שרת פנימית', 
        ...(isDev && { details: err.message }) // פירוט נוסף רק ב-Dev
    });
});

// --- 9. הפעלת השרת ---
app.listen(PORT, () => {
    console.log(`🚀 Server running on port: ${PORT} [Mode: ${isDev ? 'Development' : 'Production'}]`);
    console.log(`🛡️  Admin routes are protected by JWT`);
    if (isDev && process.env.ALLOW_DEV_PLAINTEXT_LOGIN === 'true') {
        console.log(`⚠️  SECURITY NOTE: Plain-text password fallback is ACTIVE`);
    }
});