import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, TransformationOptions } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('cloudinary.cloudName'),
      api_key: this.configService.get<string>('cloudinary.apiKey'),
      api_secret: this.configService.get<string>('cloudinary.apiSecret'),
    });
  }

  async uploadPhoto(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<{
    url: string;
    publicId: string;
    width: number;
    height: number;
  }> {
    const uploadFolder =
      folder || this.configService.get<string>('cloudinary.folder');

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: uploadFolder,
          transformation: [
            { width: 800, height: 800, crop: 'limit' }, // Max dimensions
            { quality: 'auto', fetch_format: 'auto' }, // Auto-optimize
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
            });
          } else {
            reject(new Error('Upload failed'));
          }
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async deletePhoto(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  async getOptimizedUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string;
    } = {},
  ): Promise<string> {
    const transformation: TransformationOptions[] = [];

    if (options.width || options.height) {
      transformation.push({
        width: options.width,
        height: options.height,
        crop: options.crop || 'fill',
      });
    }

    if (options.quality) {
      transformation.push({ quality: options.quality });
    }

    return cloudinary.url(publicId, {
      transformation,
      secure: true,
    });
  }
}
