/**
 * S3 Storage Service
 * AWS S3 integration for image uploads with Sharp optimization
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import { getConfig } from '../config';
import { logger } from './logger.service';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Get configuration
const config = getConfig();
const storageConfig = config.getStorageConfig();

/**
 * Image optimization options
 */
export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

/**
 * Upload options
 */
export interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  optimize?: boolean;
  optimizationOptions?: ImageOptimizationOptions;
  folder?: string;
}

/**
 * Signed URL options
 */
export interface SignedUrlOptions {
  expiresIn?: number; // Seconds
}

/**
 * S3 Storage Service class
 */
export class S3StorageService {
  private static instance: S3StorageService;
  private s3Client: S3Client | null = null;
  private bucketName: string;
  private isConfigured = false;

  private constructor() {
    this.bucketName = storageConfig.s3BucketName;
    this.initialize();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): S3StorageService {
    if (!S3StorageService.instance) {
      S3StorageService.instance = new S3StorageService();
    }
    return S3StorageService.instance;
  }

  /**
   * Initialize S3 client
   */
  private initialize(): void {
    // Only initialize if AWS storage is configured
    if (storageConfig.provider !== 'aws') {
      logger.info('S3 storage not configured - using local storage');
      return;
    }

    if (
      !storageConfig.awsAccessKeyId ||
      !storageConfig.awsSecretAccessKey ||
      !storageConfig.s3BucketName
    ) {
      logger.warn('AWS S3 credentials not configured');
      return;
    }

    try {
      this.s3Client = new S3Client({
        region: storageConfig.awsRegion,
        credentials: {
          accessKeyId: storageConfig.awsAccessKeyId,
          secretAccessKey: storageConfig.awsSecretAccessKey,
        },
      });

      this.isConfigured = true;
      logger.info(`✅ S3 Storage initialized for bucket: ${this.bucketName}`);
    } catch (error: any) {
      logger.error('Failed to initialize S3 client', error.stack);
      this.isConfigured = false;
    }
  }

  /**
   * Check if S3 is properly configured
   */
  public isReady(): boolean {
    return this.isConfigured && this.s3Client !== null;
  }

  /**
   * Optimize image using Sharp
   */
  private async optimizeImage(
    buffer: Buffer,
    options: ImageOptimizationOptions = {}
  ): Promise<Buffer> {
    try {
      const { width, height, quality = 80, format = 'webp', fit = 'cover' } = options;

      let sharpInstance = sharp(buffer);

      // Resize if dimensions are provided
      if (width || height) {
        sharpInstance = sharpInstance.resize(width, height, { fit });
      }

      // Convert to specified format
      switch (format) {
        case 'jpeg':
          sharpInstance = sharpInstance.jpeg({ quality, mozjpeg: true });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({ quality, compressionLevel: 9 });
          break;
        case 'webp':
          sharpInstance = sharpInstance.webp({ quality });
          break;
      }

      return await sharpInstance.toBuffer();
    } catch (error: any) {
      logger.error('Image optimization failed', error.stack);
      throw new Error('Failed to optimize image');
    }
  }

  /**
   * Generate unique file key
   */
  private generateFileKey(filename: string, folder?: string): string {
    const ext = path.extname(filename);
    const uniqueName = `${uuidv4()}${ext}`;
    return folder ? `${folder}/${uniqueName}` : uniqueName;
  }

  /**
   * Upload file to S3
   */
  public async upload(
    buffer: Buffer,
    filename: string,
    options: UploadOptions = {}
  ): Promise<{ key: string; url: string; size: number }> {
    if (!this.isReady()) {
      throw new Error('S3 storage is not configured');
    }

    try {
      let fileBuffer = buffer;
      let contentType = options.contentType || 'application/octet-stream';

      // Optimize image if requested
      if (options.optimize && this.isImageFile(filename)) {
        fileBuffer = await this.optimizeImage(buffer, options.optimizationOptions);

        // Update content type based on optimization format
        if (options.optimizationOptions?.format) {
          contentType = `image/${options.optimizationOptions.format}`;
        }
      }

      const key = this.generateFileKey(filename, options.folder);

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        Metadata: options.metadata,
      });

      await this.s3Client!.send(command);

      const url = this.getPublicUrl(key);
      const size = fileBuffer.length;

      logger.info(`File uploaded to S3: ${key}`);

      return { key, url, size };
    } catch (error: any) {
      logger.error('S3 upload failed', error.stack);
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  /**
   * Get file from S3
   */
  public async get(key: string): Promise<Buffer> {
    if (!this.isReady()) {
      throw new Error('S3 storage is not configured');
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client!.send(command);

      if (!response.Body) {
        throw new Error('File not found');
      }

      // Convert stream to buffer
      const buffer = await this.streamToBuffer(response.Body as any);
      return buffer;
    } catch (error: any) {
      logger.error(`S3 get failed for key: ${key}`, error.stack);
      throw new Error(`Failed to get file from S3: ${error.message}`);
    }
  }

  /**
   * Delete file from S3
   */
  public async delete(key: string): Promise<void> {
    if (!this.isReady()) {
      throw new Error('S3 storage is not configured');
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client!.send(command);
      logger.info(`File deleted from S3: ${key}`);
    } catch (error: any) {
      logger.error(`S3 delete failed for key: ${key}`, error.stack);
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }

  /**
   * Check if file exists
   */
  public async exists(key: string): Promise<boolean> {
    if (!this.isReady()) {
      throw new Error('S3 storage is not configured');
    }

    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client!.send(command);
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound') {
        return false;
      }
      logger.error(`S3 exists check failed for key: ${key}`, error.stack);
      throw new Error(`Failed to check file existence: ${error.message}`);
    }
  }

  /**
   * List files in a folder
   */
  public async list(prefix?: string, maxKeys: number = 1000): Promise<string[]> {
    if (!this.isReady()) {
      throw new Error('S3 storage is not configured');
    }

    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys,
      });

      const response = await this.s3Client!.send(command);

      return response.Contents?.map((item) => item.Key || '') || [];
    } catch (error: any) {
      logger.error('S3 list failed', error.stack);
      throw new Error(`Failed to list files from S3: ${error.message}`);
    }
  }

  /**
   * Generate signed URL for secure file access
   */
  public async getSignedUrl(key: string, options: SignedUrlOptions = {}): Promise<string> {
    if (!this.isReady()) {
      throw new Error('S3 storage is not configured');
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const expiresIn = options.expiresIn || 3600; // Default 1 hour
      const signedUrl = await getSignedUrl(this.s3Client!, command, { expiresIn });

      logger.info(`Generated signed URL for key: ${key}`);
      return signedUrl;
    } catch (error: any) {
      logger.error(`Failed to generate signed URL for key: ${key}`, error.stack);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  /**
   * Get public URL for a file
   */
  public getPublicUrl(key: string): string {
    return `https://${this.bucketName}.s3.${storageConfig.awsRegion}.amazonaws.com/${key}`;
  }

  /**
   * Get CDN URL if configured
   */
  public getCDNUrl(key: string, cdnDomain?: string): string {
    if (cdnDomain) {
      return `https://${cdnDomain}/${key}`;
    }
    return this.getPublicUrl(key);
  }

  /**
   * Check if file is an image
   */
  private isImageFile(filename: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'];
    const ext = path.extname(filename).toLowerCase();
    return imageExtensions.includes(ext);
  }

  /**
   * Convert stream to buffer
   */
  private async streamToBuffer(stream: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}

/**
 * Export singleton instance
 */
export const s3StorageService = S3StorageService.getInstance();
