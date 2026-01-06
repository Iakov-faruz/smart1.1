import apiClient from './axiosConfig';

/**
 * פונקציה להתחברות משתמש
 * שולחת שם משתמש וסיסמה ומחזירה את פרטי המשתמש מה-DB
 */
export const loginUser = async (username, password) => {
    try {
        const response = await apiClient.post('/login', { username, password });
        return response.data; // יחזיר אובייקט עם message ו-user
    } catch (error) {
        // זריקת השגיאה כדי שהקומפוננטה תוכל להציג אותה למשתמש
        throw error.response?.data?.error || 'שגיאה בחיבור לשרת';
    }
};