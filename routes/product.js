const uploadImage = require('../middlewares/uploadImage');
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

/**
 * @swagger
 * /api/product:
 *   post:
 *     summary: Tạo sản phẩm mới (hỗ trợ upload nhiều hình ảnh)
 *     tags: [Product]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               sku:
 *                 type: string
 *               description:
 *                 type: string
 *               size:
 *                type: string
 *               sizeUnit:
 *                type: enum
 *                enum: [cm, mm]
 *               categoryId:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Tạo sản phẩm thành công
 */

router.post(
    '/',
    uploadImage.uploadMultipleImages, // Middleware multer
    productController.createProduct
);

module.exports = router;
