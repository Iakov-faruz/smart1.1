// src/api/update_product_qty.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const updateProductStock = async (productId, newQty) => {
    try {
        // הנתונים נשלחים כאובייקט בפרמטר השני - זהו ה-Body
        const response = await axios.put(`${API_URL}/products/update-qty`, {
            productId: productId, 
            newQty: newQty     
        });
        
        return response.data;
    } catch (error) {
        const message = error.response?.data?.error || 'שגיאה בעדכון המלאי';
        throw new Error(message);
    }
};