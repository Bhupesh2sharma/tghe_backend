const express = require('express');
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');
const { uploadImage } = require('../config/cloudinary');
const { ApiError } = require('../utils/errors');

const router = express.Router();

const ALLOWED_MIMES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    const mime = (file.mimetype || '').toLowerCase();
    if (!ALLOWED_MIMES.includes(mime)) {
      return cb(new ApiError(400, 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP, HEIC. Got: ' + (file.mimetype || 'unknown')));
    }
    cb(null, true);
  },
});

router.post(
  '/image',
  requireAuth,
  upload.single('image'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        throw new ApiError(400, 'No image file provided. Use field name: image');
      }
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
        throw new ApiError(503, 'Image upload is not configured (Cloudinary env missing)');
      }
      const { url, publicId } = await uploadImage(req.file.buffer, req.file.mimetype);
      res.status(201).json({
        success: true,
        data: { url, publicId },
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
