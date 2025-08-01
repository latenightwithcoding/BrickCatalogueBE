const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = process.env.PATH_UPLOAD;

        // Tạo thư mục nếu chưa có
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, uuidv4() + ext);
    },
});

const upload = multer({ storage });

exports.uploadMultipleImages = upload.array('images', 5);
