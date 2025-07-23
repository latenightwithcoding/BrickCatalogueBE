// controllers/usersController.js
const User = require('../models/user');
const Auth = require('../utilities/security');
const TextConvert = require('../utilities/textConvert');
const { v4: uuidv4 } = require('uuid');

exports.getUsers = async (req, res) => {
    try {
        const users = await User.getUsers();
        const userReturn = users.map(user => ({
            id: user.Id,
            name: TextConvert.convertFromUnicodeEscape(user.Name),
            createdAt: user.CreatedAt,
        }));
        res.json(userReturn);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createUser = async (req, res) => {
    const { username, name, password } = req.body;
    try {
        const { hashedPassword, salt } = Auth.createHashPassword(password);
        var newId = await generateId();
        console.log(`New user ID: ${newId}`);
        const existingUser = await User.getUserByUsername(username);
        if (existingUser) {
            throw new Error('Tên đăng nhập đã tồn tại');
        }
        await User.createUser(
            newId,
            username,
            TextConvert.convertToUnicodeEscape(name),
            hashedPassword,
            salt,
            "Active",
            new Date()
        );
        res.status(201).json({ message: 'Tạo người dùng thành công' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.getUserByUsername(username);
        if (!user) {
            throw new Error('Không tìm thấy người dùng');
        }
        if (!Auth.verifyPasswordHashed(password, user.Salt, user.Password)) {
            throw new Error('Sai mật khẩu');
        }
        var userData = {
            id: user.Id,
            username: user.Username,
            name: TextConvert.convertFromUnicodeEscape(user.Name),
            createdAt: user.CreatedAt,
            token: Auth.generateJWT(user),
        };
        res.json({ userData });
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
};

generateId = async () => {
    var newId = uuidv4();
    const existId = await User.getUserById(newId);
    if (existId) {
        return generateId();
    } else {
        return newId;
    }
}
