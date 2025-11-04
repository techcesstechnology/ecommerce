import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Allowed file types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Configure storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    // Store in uploads directory (ensure this directory exists)
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (_req, file, cb) => {
    // Generate unique filename
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter for validation
const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`));
  }
};

// Configure multer
export const uploadImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

// Multiple images upload
export const uploadMultipleImages = uploadImage.array('images', 10); // Max 10 images

// Single image upload
export const uploadSingleImage = uploadImage.single('image');

/**
 * Get the public URL for an uploaded file
 */
export const getImageUrl = (filename: string, req: Request): string => {
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}/uploads/${filename}`;
};

/**
 * Delete an uploaded file (for cleanup)
 */
export const deleteImage = async (filename: string): Promise<boolean> => {
  const fs = await import('fs/promises');
  const filePath = path.join(__dirname, '../../uploads', filename);

  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};
