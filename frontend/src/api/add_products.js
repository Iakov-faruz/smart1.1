import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const addProducts = async (productsArray) => {
    try {
        const response = await axios.post(`${API_URL}/products/add`, {
            products: productsArray
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to add products');
    }
};