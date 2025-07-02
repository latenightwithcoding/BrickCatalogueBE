// Authentication.js
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const TextConvert = require('./textConvert');
require('dotenv').config();

const KEY = process.env.SECURITY_KEY;
const ISSUER = process.env.SECURITY_ISSUER;

const Authentication = {
    generateSalt: () => {
        return crypto.randomBytes(16).toString('hex');
    },

    createHashPassword: (password) => {
        const saltString = Authentication.generateSalt();
        const salt = Buffer.from(saltString, 'utf8');
        const passwordBuffer = Buffer.from(password, 'utf8');
        const combined = Buffer.concat([passwordBuffer, salt]);
        const hashedPassword = crypto.createHash('sha256').update(combined).digest();
        return {
            salt: salt,
            hashedPassword: hashedPassword
        };
    },

    verifyPasswordHashed: (password, salt, storedPassword) => {
        const passwordBuffer = Buffer.from(password, 'utf8');
        const combined = Buffer.concat([passwordBuffer, salt]);
        const newHash = crypto.createHash('sha256').update(combined).digest();
        return Buffer.compare(storedPassword, newHash) === 0;
    },

    generateJWT: (user) => {
        const payload = {
            userid: user.Id,
            username: TextConvert.convertFromUnicodeEscape(user.Name)
        };
        return jwt.sign(payload, KEY, {
            issuer: ISSUER,
            audience: ISSUER,
            expiresIn: '5h'
        });
    },

    generateTempJWT: (email) => {
        const payload = {
            type: 'reset',
            email: email
        };
        return jwt.sign(payload, KEY, {
            issuer: ISSUER,
            audience: ISSUER,
            expiresIn: '10m'
        });
    },

    generateRefreshToken: () => {
        return crypto.randomBytes(64).toString('base64');
    },

    generateRandomPassword: () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
        const length = 12;
        const bytes = crypto.randomBytes(length);
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars[bytes[i] % chars.length];
        }
        return result;
    },

    decodeToken: (token, nameClaim) => {
        try {
            const decoded = jwt.decode(token);
            return decoded && decoded[nameClaim] ? decoded[nameClaim] : 'Error!!!';
        } catch (err) {
            return 'Error!!!';
        }
    },

    generateRandomSerial: (length) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const data = crypto.randomBytes(length);
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars[data[i] % chars.length];
        }
        return result;
    },
};

module.exports = Authentication;
