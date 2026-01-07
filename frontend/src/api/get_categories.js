import axios from 'axios';
const API_URL = 'http://localhost:5000/api';

export const getCategoriesOnly = async () => {
    try {
        const response = await axios.get(`${API_URL}/categories`);
        return response.data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
};