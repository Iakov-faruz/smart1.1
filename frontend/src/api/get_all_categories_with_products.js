import apiClient from './axiosConfig';

/**
 * פונקציה לשליפת קטגוריות והמוצרים המשויכים אליהן
 */
export const getAllCategoriesWithProducts = async () => {
    try {
        const response = await apiClient.get('/categories-with-products');
        return response.data;
    } catch (error) {
        console.error("שגיאה בשליפת קטגוריות ומוצרים:", error.response?.data || error.message);
        throw error;
    }
};