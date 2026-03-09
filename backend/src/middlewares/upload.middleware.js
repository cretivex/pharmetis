import multer from 'multer';
import path from 'path';

// Configure multer for memory storage (we'll process files in memory)
const storage = multer.memoryStorage();

// File filter to only accept .xlsx files for bulk upload
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx only
  ];
  
  const allowedExtensions = ['.xlsx'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only Excel (.xlsx) files are allowed.'), false);
  }
};

export const uploadFile = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB limit
  }
});
