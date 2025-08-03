require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/category');
const productRoutes = require('./routes/product');
const authRoutes = require('./routes/auth');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ✅ Cấu hình CORS đúng cách
const allowedOrigins = [
    'http://localhost:5173',
    'https://demo.xuanhuong.buubuu.id.vn',
    'http://localhost:3000',
    'https://vlxdxuanhuong.com'
];

app.use(cors({
    origin: function (origin, callback) {
        // Cho phép nếu không có origin (như Postman) hoặc nằm trong danh sách
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));


// Swagger
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/product', productRoutes);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Swagger UI: http://localhost:${PORT}/swagger`);
});
