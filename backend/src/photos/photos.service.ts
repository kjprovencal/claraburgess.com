import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo } from './entities/photo.entity';
import { CloudinaryService } from './cloudinary.service';
import { CreatePhotoDto, UpdatePhotoDto } from './dto/photos.dto';

@Injectable()
export class PhotosService {
  constructor(
    @InjectRepository(Photo)
    private photosRepository: Repository<Photo>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async getAllPhotos(): Promise<Photo[]> {
    return this.photosRepository.find({
      order: { date: 'DESC' },
    });
  }

  async getPhotoById(id: string): Promise<Photo> {
    const photo = await this.photosRepository.findOne({ where: { id } });
    if (!photo) {
      throw new NotFoundException(`Photo with ID ${id} not found`);
    }
    return photo;
  }

  async createPhoto(
    createPhotoDto: CreatePhotoDto,
    file?: Express.Multer.File,
  ): Promise<Photo> {
    let photoData = { ...createPhotoDto };

    if (file) {
      // Upload to Cloudinary
      const uploadResult = await this.cloudinaryService.uploadPhoto(file);
      photoData.url = uploadResult.url;
      photoData.publicId = uploadResult.publicId;
      photoData.width = uploadResult.width;
      photoData.height = uploadResult.height;
    }

    const newPhoto = this.photosRepository.create(photoData);
    return this.photosRepository.save(newPhoto);
  }

  async updatePhoto(
    id: string,
    updatePhotoDto: UpdatePhotoDto,
  ): Promise<Photo> {
    const photo = await this.getPhotoById(id);
    Object.assign(photo, updatePhotoDto);
    return this.photosRepository.save(photo);
  }

  async deletePhoto(id: string): Promise<void> {
    const photo = await this.getPhotoById(id);

    // Delete from Cloudinary if publicId exists
    if (photo.publicId) {
      try {
        await this.cloudinaryService.deletePhoto(photo.publicId);
      } catch (error) {
        console.error('Failed to delete from Cloudinary:', error);
      }
    }

    await this.photosRepository.remove(photo);
  }

  async getPhotosByCategory(category: string): Promise<Photo[]> {
    if (category === 'All') {
      return this.getAllPhotos();
    }
    return this.photosRepository.find({
      where: { category },
      order: { date: 'DESC' },
    });
  }

  async getOptimizedPhotoUrl(
    id: string,
    options: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string;
    } = {},
  ): Promise<string> {
    const photo = await this.getPhotoById(id);

    if (photo.publicId) {
      return this.cloudinaryService.getOptimizedUrl(photo.publicId, options);
    }

    return photo.url; // Fallback to original URL
  }
}
