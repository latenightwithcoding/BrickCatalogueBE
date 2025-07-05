const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middlewares/auth');

/**
 * @swagger
 * /api/category:
 *   get:
 *     summary: Lấy danh sách danh mục
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: Danh sách danh mục
 */
router.get('/', categoryController.getCategories);

module.exports = router;
