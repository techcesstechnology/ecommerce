import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { ProductImage } from '../types/product.types';

export class ImageService {
  private uploadDir: string;
  private cdnUrl: string;
  private thumbnailWidth = 300;
  private thumbnailHeight = 300;

  constructor(uploadDir: string = './uploads', cdnUrl: string = '') {
    this.uploadDir = uploadDir;
    this.cdnUrl = cdnUrl;
  }

  /**
   * Initialize upload directories
   */
  async initializeDirectories(): Promise<void> {
    const dirs = [
      this.uploadDir,
      path.join(this.uploadDir, 'products'),
      path.join(this.uploadDir, 'products', 'thumbnails')
    ];

    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        console.error(`Failed to create directory ${dir}:`, error);
      }
    }
  }

  /**
   * Process and save product image
   */
  async processProductImage(
    file: Express.Multer.File,
    productId: string,
    order: number = 0
  ): Promise<ProductImage> {
    await this.initializeDirectories();

    const timestamp = Date.now();
    const filename = `${productId}-${timestamp}-${order}.jpg`;
    const thumbnailFilename = `${productId}-${timestamp}-${order}-thumb.jpg`;

    const imagePath = path.join(this.uploadDir, 'products', filename);
    const thumbnailPath = path.join(this.uploadDir, 'products', 'thumbnails', thumbnailFilename);

    // Process and save main image
    await sharp(file.buffer)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toFile(imagePath);

    // Generate and save thumbnail
    await sharp(file.buffer)
      .resize(this.thumbnailWidth, this.thumbnailHeight, {
        fit: 'cover'
      })
      .jpeg({ quality: 75 })
      .toFile(thumbnailPath);

    const baseUrl = this.cdnUrl || '/uploads';
    
    return {
      url: `${baseUrl}/products/${filename}`,
      thumbnailUrl: `${baseUrl}/products/thumbnails/${thumbnailFilename}`,
      alt: file.originalname,
      order
    };
  }

  /**
   * Process multiple images
   */
  async processMultipleImages(
    files: Express.Multer.File[],
    productId: string
  ): Promise<ProductImage[]> {
    const images: ProductImage[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const image = await this.processProductImage(files[i], productId, i);
      images.push(image);
    }

    return images;
  }

  /**
   * Delete product images
   */
  async deleteProductImages(images: ProductImage[]): Promise<void> {
    for (const image of images) {
      try {
        // Remove CDN URL prefix to get local path
        const imagePath = image.url.replace(this.cdnUrl || '/uploads', this.uploadDir);
        const thumbnailPath = image.thumbnailUrl.replace(this.cdnUrl || '/uploads', this.uploadDir);

        await fs.unlink(imagePath).catch(() => {});
        await fs.unlink(thumbnailPath).catch(() => {});
      } catch (error) {
        console.error('Failed to delete image:', error);
      }
    }
  }

  /**
   * Validate image file
   */
  validateImageFile(file: Express.Multer.File): { valid: boolean; error?: string } {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size exceeds 5MB limit.'
      };
    }

    return { valid: true };
  }
}

export const imageService = new ImageService(
  process.env.UPLOAD_DIR || './uploads',
  process.env.CDN_URL || ''
);
