import axios from 'axios';

// כתובת ה-API שלך
const API_URL = 'http://localhost:5000/api'; 

export const createOrder = async (orderData) => {
    try {
        const response = await axios.post(`${API_URL}/create_order`, orderData);
        return response.data;
    } catch (error) {
        // מחזיר את הודעת השגיאה מהשרת אם קיימת
        throw error.response?.data?.error || 'שגיאה בביצוע ההזמנה';
    }
};