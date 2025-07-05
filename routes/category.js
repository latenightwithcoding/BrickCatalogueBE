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

/**
 * @swagger
 * /api/category:
 *   post:
 *     summary: Thêm danh sách danh mục
 *     tags: [Category]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required:
 *                 - name
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "Ngói"
 *                 child:
 *                   type: array
 *                   items:
 *                     type: object
 *                     required:
 *                       - name
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Ngói đồng nai"
 *     responses:
 *       200:
 *         description: Danh sách danh mục đã được thêm thành công
 */

router.post('/', categoryController.addCategory);

module.exports = router;
