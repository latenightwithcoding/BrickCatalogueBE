const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.SECURITY_KEY;
const ISSUER = process.env.SECURITY_ISSUER;

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY, {
            issuer: ISSUER,
            audience: ISSUER
        });

        // Gắn thông tin user vào request
        req.user = decoded;
        next();
    } catch (err) {
        let message = 'Unauthorized';
        if (err.name === 'TokenExpiredError') {
            message = 'Token expired';
        } else if (err.name === 'JsonWebTokenError') {
            message = 'Invalid token';
        } else if (err.name === 'NotBeforeError') {
            message = 'Token not active';
        }

        return res.status(401).json({ error: message });
    }
};
