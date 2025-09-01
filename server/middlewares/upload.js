// middlewares/upload.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    let folder;

    // Map fieldname to Cloudinary folder
    switch (file.fieldname) {
      case 'Bike Book':
        folder = 'bikes/documents/bike_books';
        break;
      case 'Revenue License':
        folder = 'bikes/documents/revenue_licenses';
        break;
      case 'Insurance':
        folder = 'bikes/documents/insurances';
        break;
      case 'Emmision Test':
        folder = 'bikes/documents/emission_tests';
        break;
      case 'images':
        folder = 'bikes/images';
        break;
      default:
        folder = 'bikes/others';
    }

    return {
      folder: folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
      resource_type: 'auto',
      public_id: `${file.fieldname}_${req.user._id}_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    };
  },
});

// Multer instance
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max per file
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.originalname}`));
    }
  },
});

// Middleware for multiple fields
// documents can be multiple, images can be multiple
const uploadBikeFiles = upload.fields([
  { name: 'Bike Book', maxCount: 1 },
  { name: 'Revenue License', maxCount: 1 },
  { name: 'Insurance', maxCount: 1 },
  { name: 'Emmision Test', maxCount: 1 },
  { name: 'images', maxCount: 10 },
]);

module.exports = uploadBikeFiles; 
