import apiClient from './axiosConfig';

export const createCustomer = async (customerData) => {
    try {
        const response = await apiClient.post('/create_customer', customerData);
        return response.data;
    } catch (error) {
        console.error("שגיאה ביצירת לקוח:", error.response?.data || error.message);
        throw error;
    }
};