const uploadImage = require('../middlewares/uploadImage');
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/auth');

/**
 * @swagger
 * /api/product/{id}:
 *   delete:
 *     summary: Xóa sản phẩm
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của sản phẩm
 *     responses:
 *       201:
 *         description: Tạo sản phẩm thành công
 */
router.delete(
    '/:id',
    authMiddleware,
    productController.deleteProduct
);

/**
 * @swagger
 * /api/product/{id}:
 *   put:
 *     summary: Cập nhật sản phẩm (hỗ trợ upload nhiều hình ảnh)
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của sản phẩm
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
router.put(
    '/:id',
    authMiddleware,
    uploadImage.uploadMultipleImages, // Middleware multer
    productController.updateProduct
);

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
    authMiddleware,
    uploadImage.uploadMultipleImages, // Middleware multer
    productController.createProduct
);

/**
 * @swagger
 * /api/product:
 *   get:
 *     summary: Lấy danh sách sản phẩm theo điều kiện lọc
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: ID danh mục
 *         required: true
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Tên sản phẩm
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm
 */
router.get(
    '/',
    productController.getProducts
);

/**
 * @swagger
 * /api/product/admin:
 *   get:
 *     summary: Lấy danh sách sản phẩm cho quản trị viên
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Số trang
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: Số lượng sản phẩm trên mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm
 */
router.get(
    '/admin',
    authMiddleware,
    productController.getProductsForAdmin
);

/**
 * @swagger
 * /api/product/admin/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết sản phẩm theo ID
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của sản phẩm
 *     responses:
 *       200:
 *         description: Thông tin chi tiết sản phẩm
 *       404:
 *         description: Không tìm thấy sản phẩm
 */
router.get(
    '/admin/:id',
    authMiddleware,
    productController.getProductForAdmin
);

/**
 * @swagger
 * /api/product/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết sản phẩm theo ID
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của sản phẩm
 *     responses:
 *       200:
 *         description: Thông tin chi tiết sản phẩm
 *       404:
 *         description: Không tìm thấy sản phẩm
 */
router.get(
    '/:id',
    productController.getProduct
);

module.exports = router;
