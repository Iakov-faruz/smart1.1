import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const updateProductById = async (id, productData) => {
    try {
        // שולח את כל המידע כולל ה-SKU החדש או הקיים
        const response = await axios.put(`${API_URL}/products/update/${id}`, productData);
        return response.data;
    } catch (error) {
        console.error("API Error:", error);
        throw new Error(error.response?.data?.error || 'נכשלה פעולת העדכון');
    }
};