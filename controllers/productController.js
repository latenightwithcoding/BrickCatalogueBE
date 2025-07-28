const { v4: uuidv4 } = require('uuid');
const Product = require('../models/product');
const ProductAttachment = require('../models/productAttachment');
const TextConvert = require('../utilities/textConvert');
const Category = require('../models/category');
require('dotenv').config();

exports.createProduct = async (req, res) => {
    try {
        const requestBody = req.body;
        const files = req.files;

        if (!requestBody || !requestBody.name || !requestBody.sku || !requestBody.categoryId) {
            return res.status(400).json({ error: 'Invalid request body' });
        }

        const imageUrls = files.map((file) => `${process.env.URL_UPLOAD}/${file.filename}`);
        const createdAt = new Date(Date.now() + 7 * 60 * 60 * 1000);
        const unsignName = TextConvert.convertToUnSign(requestBody.name);

        const productData = {
            id: uuidv4(),
            name: TextConvert.convertToUnicodeEscape(requestBody.name),
            sku: requestBody.sku,
            description: TextConvert.convertToUnicodeEscape(requestBody.description || ''),
            size: requestBody.size,
            sizeUnit: requestBody.sizeUnit,
            status: true,
            categoryId: requestBody.categoryId,
            unsignName: unsignName,
            createdAt,
        };

        const Images = [];

        for (const imageUrl of imageUrls) {
            var image = {
                id: uuidv4(),
                productId: productData.id,
                type: "image",
                attachmentURL: imageUrl,
            };
            Images.push(image);
        }

        const insertedProduct = await Product.addProduct(productData);
        const insertImage = await ProductAttachment.addProductImages(Images);
        return res.status(201).json({ success: true, data: insertedProduct });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error', detail: err.message });
    }
}

exports.getProducts = async (req, res) => {
    try {
        const { categoryId, name } = req.query;

        const products = await Product.getProducts({ categoryId });
        const category = await Category.getCategory(categoryId);
        return res.status(200).json({
            success: true, data: {
                id: category.id,
                name: TextConvert.convertFromUnicodeEscape(category.name),
                products: products
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error', detail: err.message });
    }
};

exports.getProduct = async (req, res) => {
    try {
        const { id } = req.params; // ✅ Sửa từ 'productId' thành 'id'

        if (!id) {
            return res.status(400).json({ error: 'Product ID is required' });
        }

        const product = await Product.getProduct(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // const attachments = await ProductAttachment.getProductAttachments(id);
        // product.attachments = attachments;

        return res.status(200).json({ success: true, data: product });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error', detail: err.message });
    }
}

exports.getProductsForAdmin = async (req, res) => {
    try {
        const { keyword, page, pageSize } = req.query;
        const products = await Product.getProductsForAdmin({ search: keyword, page, pageSize });
        return res.status(200).json({ success: true, data: products });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error', detail: err.message });
    }
};

