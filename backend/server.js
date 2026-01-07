const express = require('express');
const cors = require('cors');
require('dotenv').config();

// ייבוא ה-Routes
const productRoutes = require('./routes/get_all_products');
const categoryRoutes = require('./routes/get_all_category_with_products');
const customerRoutes = require('./routes/create_customer');
const loginRoutes = require('./routes/login');
const createOrderRoute = require('./routes/create_order'); // ה-Route החדש

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());

// רישום ה-Routes תחת תחילית /api
app.use('/api', productRoutes);
app.use('/api', categoryRoutes);
app.use('/api', customerRoutes);
app.use('/api', loginRoutes);
app.use('/api', createOrderRoute); // רישום אחד תקין של ה-Route להזמנות

// Global Error Handler - חייב להיות אחרי כל ה-Routes
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err.message);
    console.error('STACK:', err.stack);
    res.status(500).send({ error: 'Internal Server Error', details: err.message });
});

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});