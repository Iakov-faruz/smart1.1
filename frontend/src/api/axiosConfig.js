import axios from 'axios';

// יצירת לקוח מוגדר מראש לשרת בפורט 5000
const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

export default apiClient;