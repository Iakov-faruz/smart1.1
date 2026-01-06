const express = require('express');
const cors = require('cors');
require('dotenv').config();

const productRoutes = require('./routes/get_all_products');
const categoryRoutes = require('./routes/get_all_category_with_products');
const customerRoutes = require('./routes/create_customer');
const loginRoutes = require('./routes/login');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());

// Routes
app.use('/api', productRoutes);
app.use('/api', categoryRoutes);
app.use('/api', customerRoutes);
app.use('/api', loginRoutes);

// Global Error Handler for logging
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err.message);
    console.error('STACK:', err.stack);
    res.status(500).send({ error: 'Internal Server Error', details: err.message });
});

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});