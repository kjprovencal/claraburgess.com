import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
} from '@nestjs/common';
import { RegistryService } from './registry.service';
import {
  CreateRegistryItemDto,
  UpdateRegistryItemDto,
} from './dto/registry.dto';
import { RateLimitGuard } from '../rate-limit/guards/rate-limit.guard';
import { RateLimit } from '../rate-limit/decorators/rate-limit.decorator';

@Controller('api/registry')
export class RegistryController {
  constructor(private readonly registryService: RegistryService) {}

  @Get()
  @UseGuards(RateLimitGuard)
  @RateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 30, // 30 requests per 5 minutes
    endpoint: 'registry-read',
  })
  async getAllItems() {
    return this.registryService.getAllItems();
  }

  @Get(':id')
  @UseGuards(RateLimitGuard)
  @RateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 30, // 30 requests per 5 minutes
    endpoint: 'registry-read',
  })
  async getItemById(@Param('id') id: string) {
    return this.registryService.getItemById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createItem(@Body() createItemDto: CreateRegistryItemDto) {
    return this.registryService.createItem(createItemDto);
  }

  @Put(':id')
  async updateItem(
    @Param('id') id: string,
    @Body() updateItemDto: UpdateRegistryItemDto,
  ) {
    return this.registryService.updateItem(id, updateItemDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteItem(@Param('id') id: string) {
    return this.registryService.deleteItem(id);
  }

  @Put(':id/toggle-purchased')
  async togglePurchased(@Param('id') id: string) {
    return this.registryService.togglePurchased(id);
  }

  @Get('preview/link')
  async getLinkPreview(@Query('url') url: string) {
    if (!url) {
      throw new Error('URL parameter is required');
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      throw new Error('Invalid URL format');
    }

    return this.registryService.generatePreview(url);
  }
}
