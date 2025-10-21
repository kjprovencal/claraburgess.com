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
import { CreatePurchaseDto } from './dto/purchase.dto';
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

  @Put(':id/purchase')
  @UseGuards(RateLimitGuard)
  @RateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 10, // 10 requests per 5 minutes
    endpoint: 'registry-purchase',
  })
  async purchase(
    @Param('id') id: string,
    @Body() purchaseData: CreatePurchaseDto,
  ) {
    return this.registryService.purchase(id, purchaseData);
  }

  @Get(':id/purchases')
  @UseGuards(RateLimitGuard)
  @RateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 30, // 30 requests per 5 minutes
    endpoint: 'registry-purchases',
  })
  async getItemPurchases(@Param('id') id: string) {
    return this.registryService.getItemPurchases(id);
  }

  @Get('preview/link')
  async getLinkPreview(
    @Query('url') url: string,
    @Query('name') name?: string,
    @Query('imageUrl') imageUrl?: string,
    @Query('description') description?: string,
  ) {
    const fallbackData =
      name || imageUrl || description
        ? {
            name,
            imageUrl,
            description,
          }
        : undefined;

    return this.registryService.getLinkPreview(url, fallbackData);
  }
}
