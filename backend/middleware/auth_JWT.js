const jwt = require('jsonwebtoken');

/**
 * Middleware לאימות הטוקן של המנהל (JWT)
 * הפונקציה בודקת האם הבקשה שהגיעה מכילה טוקן תקף ב-Header
 */
const verifyAdmin = (req, res, next) => {
    // 1. שליפת ה-Header שנקרא Authorization
    const authHeader = req.headers['authorization'];
    
    // 2. שליפת הטוקן עצמו (הוא מגיע בפורמט "Bearer <token>")
    const token = authHeader && authHeader.split(' ')[1];

    // 3. אם אין טוקן - מחזירים שגיאת 401 (Unauthorized)
    if (!token) {
        return res.status(401).json({ error: 'גישה נדחתה: לא נמצא טוקן אימות' });
    }

    try {
        // 4. אימות הטוקן מול המפתח הסודי שהגדרת ב-.env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 5. שמירת המידע שפוענח בתוך אובייקט ה-req כדי שה-Routes הבאים יוכלו להשתמש בו
        req.admin = decoded; 

        // 6. הכל תקין - עוברים לפונקציה הבאה בשרשרת (ה-Route עצמו)
        next();
    } catch (err) {
        // 7. אם הטוקן לא תקין או פג תוקף - מחזירים 403 (Forbidden)
        return res.status(403).json({ error: 'טוקן לא בתוקף או שפג תוקפו' });
    }
};

module.exports = { verifyAdmin };