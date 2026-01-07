import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

/**
 * התחברות מנהל - שליחת נתונים ב-Body של הבקשה
 */
export const loginAdmin = async (username, email, password) => {
    try {
        // שליחת אובייקט הנתונים כפרמטר השני של axios.post
        const response = await axios.post(`${API_URL}/admin/login`, {
            username: username,
            email: email,
            password: password
        });
        
        // החזרת הנתונים מהשרת (בדרך כלל אובייקט עם message ו-admin)
        return response.data;
    } catch (error) {
        // שליפת הודעת השגיאה המדויקת מהשרת
        const errorMessage = error.response?.data?.error || 'שגיאה בחיבור לשרת הניהול';
        throw new Error(errorMessage);
    }
};