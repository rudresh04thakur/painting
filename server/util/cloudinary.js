const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');

function initCloudinary() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET
    });
  }
}

async function uploadImage(localPath) {
  const hasCloud = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
  if (hasCloud) {
    const res = await cloudinary.uploader.upload(localPath, { folder: 'painting-gallery' });
    fs.unlinkSync(localPath);
    return res.secure_url;
  } else {
    return '/uploads/' + path.basename(localPath);
  }
}

module.exports = { initCloudinary, uploadImage };
