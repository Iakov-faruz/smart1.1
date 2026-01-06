import apiClient from './axiosConfig';

/**
 * פונקציה לשליפת כל המוצרים
 * עושה שימוש בלקוח המוגדר ב-axiosConfig
 */
export const getAllProducts = async () => {
    try {
        const response = await apiClient.get('/products');
        return response.data; // מחזיר את רשימת המוצרים
    } catch (error) {
        console.error("שגיאה בשליפת מוצרים:", error.response?.data || error.message);
        throw error;
    }
};