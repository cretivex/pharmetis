import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { randomUUID } from 'crypto';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { hasS3Config, s3Client } from '../config/s3.js';

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

const UPLOAD_TYPES = new Set([
  'products',
  'vendors',
  'buyers',
  'prescriptions',
  'documents',
  'banners',
  'categories',
  'subcategories'
]);

export const isAllowedUploadType = (type) => UPLOAD_TYPES.has(type);

const imageFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (IMAGE_MIME_TYPES.includes(file.mimetype) && IMAGE_EXTENSIONS.includes(ext)) {
    cb(null, true);
    return;
  }
  cb(new Error('Invalid file type. Allowed types: jpg, jpeg, png, webp.'), false);
};

const s3Storage = hasS3Config()
  ? multerS3({
      s3: s3Client,
      bucket: env.S3_BUCKET || process.env.S3_BUCKET,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (req, file, cb) => {
        const uploadType = req.params.type;
        if (!isAllowedUploadType(uploadType)) {
          cb(new Error('Invalid upload type.'));
          return;
        }
        const ext = path.extname(file.originalname || '').toLowerCase();
        cb(null, `${uploadType}/${Date.now()}-${randomUUID()}${ext}`);
      }
    })
  : multer.memoryStorage();

export const uploadImageToS3 = multer({
  storage: s3Storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

export const ensureS3Configured = (_req, _res, next) => {
  if (!hasS3Config()) {
    next(new ApiError(500, 'S3 upload is not configured on this server.'));
    return;
  }
  next();
};

// Legacy Excel uploader for bulk product upload.
const excelStorage = multer.memoryStorage();
const excelFileFilter = (req, file, cb) => {
  const isValidMimeType = file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const isValidExtension = (file.originalname || '').toLowerCase().endsWith('.xlsx');
  if (isValidMimeType || isValidExtension) {
    cb(null, true);
    return;
  }
  cb(new Error('Invalid file type. Only Excel (.xlsx) files are allowed.'), false);
};

export const uploadFile = multer({
  storage: excelStorage,
  fileFilter: excelFileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024
  }
});
