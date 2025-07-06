import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotosService } from './photos.service';
import { CreatePhotoDto, UpdatePhotoDto } from './dto/photos.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Get()
  async getAllPhotos() {
    return this.photosService.getAllPhotos();
  }

  @Get(':id')
  async getPhotoById(@Param('id') id: string) {
    return this.photosService.getPhotoById(id);
  }

  @Get('category/:category')
  async getPhotosByCategory(@Param('category') category: string) {
    return this.photosService.getPhotosByCategory(category);
  }

  @Get(':id/optimized')
  async getOptimizedPhoto(
    @Param('id') id: string,
    @Body() options: { width?: number; height?: number; crop?: string; quality?: string }
  ) {
    const url = await this.photosService.getOptimizedPhotoUrl(id, options);
    return { url };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async createPhoto(
    @Body() createPhotoDto: CreatePhotoDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.photosService.createPhoto(createPhotoDto, file);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updatePhoto(@Param('id') id: string, @Body() updatePhotoDto: UpdatePhotoDto) {
    return this.photosService.updatePhoto(id, updatePhotoDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePhoto(@Param('id') id: string) {
    return this.photosService.deletePhoto(id);
  }
}
