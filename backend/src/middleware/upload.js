const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

// Ensure local uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure Cloudinary (if credentials are provided)
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloudinary_cloud_name';

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  logger.info('Cloudinary initialized successfully.');
} else {
  logger.warn('Cloudinary keys missing. Falling back to local file storage under backend/src/uploads.');
}

// Multer Storage Configuration (Local Disk Storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File Filtering based on file types
const fileFilter = (req, file, cb) => {
  const allowedExtensions = {
    image: ['.jpg', '.jpeg', '.png', '.webp'],
    video: ['.mp4', '.mkv', '.avi', '.mov'],
  };

  const ext = path.extname(file.originalname).toLowerCase();
  
  if (file.fieldname === 'thumbnail' || file.fieldname === 'banner' || file.fieldname === 'image') {
    if (allowedExtensions.image.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only images (.jpg, .jpeg, .png, .webp) are allowed!'), false);
    }
  } else if (file.fieldname === 'trailer' || file.fieldname === 'video') {
    if (allowedExtensions.video.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only videos (.mp4, .mkv, .avi, .mov) are allowed!'), false);
    }
  } else {
    cb(null, true); // Allow other uploads
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for video files
  },
});

/**
 * Service function to handle uploading a file to Cloudinary or returning local path
 */
const uploadToCloud = async (localFilePath, folderName = 'ott_platform') => {
  if (!localFilePath) return null;

  try {
    if (isCloudinaryConfigured) {
      const resourceType = path.extname(localFilePath).toLowerCase().match(/\.(mp4|mkv|avi|mov)$/) ? 'video' : 'image';
      
      const result = await cloudinary.uploader.upload(localFilePath, {
        folder: folderName,
        resource_type: resourceType,
      });

      // Cleanup local temp file async
      fs.unlink(localFilePath, (err) => {
        if (err) logger.error('Error deleting local temp file: %s', err.message);
      });

      return result.secure_url;
    } else {
      // Return relative local path accessible via static serving
      const fileName = path.basename(localFilePath);
      return `/uploads/${fileName}`;
    }
  } catch (error) {
    logger.error('File upload error: %o', error);
    throw new Error('Upload to cloud server failed: ' + error.message);
  }
};

module.exports = {
  upload,
  uploadToCloud,
};
