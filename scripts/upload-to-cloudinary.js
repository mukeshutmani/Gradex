const { v2: cloudinary } = require('cloudinary');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadImage(imagePath) {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: 'gradex',
      public_id: 'student-dashboard',
      overwrite: true,
    });

    console.log('Upload successful!');
    console.log('URL:', result.secure_url);
    return result;
  } catch (error) {
    console.error('Upload failed:', error.message);
    process.exit(1);
  }
}

uploadImage('C:\\Users\\T495s\\Downloads\\student dahsboard.png');
