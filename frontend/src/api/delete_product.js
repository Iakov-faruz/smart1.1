import axios from 'axios';
const API_URL = 'http://localhost:5000/api';

export const deleteProduct = async (productId) => {
    try {
        // אנחנו עדיין משתמשים במתודת DELETE מבחינת ה-REST, אבל השרת עושה UPDATE
        const response = await axios.delete(`${API_URL}/products/${productId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'לא ניתן להסיר את המוצר כרגע');
    }
};