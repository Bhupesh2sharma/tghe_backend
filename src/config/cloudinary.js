const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const UPLOAD_FOLDER = process.env.CLOUDINARY_FOLDER || 'tghe';

async function uploadImage(buffer, mimeType, options = {}) {
  const folder = options.folder ?? UPLOAD_FOLDER;
  const dataUri = `data:${mimeType};base64,${buffer.toString('base64')}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: 'image',
    ...options,
  });
  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

async function deleteImage(publicId) {
  const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  return result;
}

module.exports = { cloudinary, uploadImage, deleteImage, UPLOAD_FOLDER };
