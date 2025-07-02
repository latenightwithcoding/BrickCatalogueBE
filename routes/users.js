const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const auth = require('../middlewares/auth');

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lấy danh sách người dùng
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Danh sách người dùng
 */
router.get('/', auth, usersController.getUsers);

module.exports = router;
