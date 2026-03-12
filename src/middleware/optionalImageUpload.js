const multer = require('multer');
const { uploadImage } = require('../config/cloudinary');
const { ApiError } = require('../utils/errors');

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      return cb(new ApiError(400, 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP'));
    }
    cb(null, true);
  },
});

const singleImage = upload.single('image');
const multipleImages = upload.array('images', 20); // support minimum 6, max 20
const imageAndImages = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 20 },
]);

async function resolveImageUrl(req, res, next) {
  if (!req.file) return next();
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    return next(new ApiError(503, 'Image upload is not configured (Cloudinary env missing)'));
  }
  try {
    const { url } = await uploadImage(req.file.buffer, req.file.mimetype);
    req.body.image = url;
    next();
  } catch (err) {
    next(err);
  }
}

async function resolveMultipleImagesUrl(req, res, next) {
  const files = req.files && (Array.isArray(req.files) ? req.files : req.files.images);
  if (!files?.length) return next();
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    return next(new ApiError(503, 'Image upload is not configured (Cloudinary env missing)'));
  }
  try {
    const urls = await Promise.all(
      files.map((file) => uploadImage(file.buffer, file.mimetype).then((r) => r.url))
    );
    req.body.images = req.body.images && Array.isArray(req.body.images)
      ? [...req.body.images, ...urls]
      : urls;
    next();
  } catch (err) {
    next(err);
  }
}

async function resolveImageAndImagesUrl(req, res, next) {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    return next(new ApiError(503, 'Image upload is not configured (Cloudinary env missing)'));
  }
  try {
    if (req.files?.image?.[0]) {
      const { url } = await uploadImage(
        req.files.image[0].buffer,
        req.files.image[0].mimetype
      );
      req.body.image = url;
    }
    const imageFiles = req.files?.images || [];
    if (imageFiles.length) {
      const urls = await Promise.all(
        imageFiles.map((file) => uploadImage(file.buffer, file.mimetype).then((r) => r.url))
      );
      req.body.images = req.body.images && Array.isArray(req.body.images)
        ? [...req.body.images, ...urls]
        : urls;
    }
    next();
  } catch (err) {
    next(err);
  }
}

function optionalImageUpload(req, res, next) {
  singleImage(req, res, (err) => {
    if (err) return next(err);
    resolveImageUrl(req, res, next);
  });
}

function optionalMultipleImagesUpload(req, res, next) {
  multipleImages(req, res, (err) => {
    if (err) return next(err);
    resolveMultipleImagesUrl(req, res, next);
  });
}

function optionalImageAndImagesUpload(req, res, next) {
  imageAndImages(req, res, (err) => {
    if (err) return next(err);
    resolveImageAndImagesUrl(req, res, next);
  });
}

module.exports = {
  optionalImageUpload,
  optionalMultipleImagesUpload,
  optionalImageAndImagesUpload,
};
