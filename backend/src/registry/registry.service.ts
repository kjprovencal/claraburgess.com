import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistryItem } from './entities/registry-item.entity';
import {
  CreateRegistryItemDto,
  UpdateRegistryItemDto,
} from './dto/registry.dto';
import { LinkPreviewService } from './link-preview.service';
import { LinkPreviewDto } from 'src/registry/dto/link-preview.dto';

@Injectable()
export class RegistryService {
  private readonly logger = new Logger(RegistryService.name);

  constructor(
    @InjectRepository(RegistryItem)
    private registryItemsRepository: Repository<RegistryItem>,
    private linkPreviewService: LinkPreviewService,
  ) {}

  async getAllItems(): Promise<RegistryItem[]> {
    const items = await this.registryItemsRepository.find({
      order: { createdAt: 'DESC' },
    });

    // Enhance items with cached preview data if available
    for (const item of items) {
      if (item.url) {
        await this.populateCachedPreviewData(item);
      }
    }

    return items;
  }

  async getItemById(id: string): Promise<RegistryItem> {
    const item = await this.registryItemsRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Registry item with ID ${id} not found`);
    }

    // Enhance item with cached preview data if available
    if (item.url) {
      await this.populateCachedPreviewData(item);
    }

    return item;
  }

  async createItem(
    createItemDto: CreateRegistryItemDto,
  ): Promise<RegistryItem> {
    const newItem = this.registryItemsRepository.create(createItemDto);
    return this.registryItemsRepository.save(newItem);
  }

  async updateItem(
    id: string,
    updateItemDto: UpdateRegistryItemDto,
  ): Promise<RegistryItem> {
    const item = await this.getItemById(id);

    // If URL is being updated, invalidate cache for the old URL
    if (updateItemDto.url && updateItemDto.url !== item.url && item.url) {
      await this.linkPreviewService.invalidateCacheForUrl(item.url);
    }

    Object.assign(item, updateItemDto);
    return this.registryItemsRepository.save(item);
  }

  async deleteItem(id: string): Promise<void> {
    const item = await this.getItemById(id);
    await this.registryItemsRepository.remove(item);
  }

  async purchase(
    id: string,
    additionalQuantity: number,
  ): Promise<RegistryItem> {
    const item = await this.getItemById(id);

    // Validate additional quantity
    if (additionalQuantity < 1) {
      throw new Error('Additional quantity must be at least 1');
    }

    // Add to existing purchased quantity
    item.purchasedQuantity += additionalQuantity;
    item.purchased = item.purchasedQuantity > 0;

    return this.registryItemsRepository.save(item);
  }

  async getLinkPreview(
    url: string,
    fallbackData?: { name?: string; imageUrl?: string; description?: string },
  ): Promise<LinkPreviewDto> {
    return this.linkPreviewService.generatePreview(url, fallbackData);
  }

  private async populateCachedPreviewData(item: RegistryItem): Promise<void> {
    if (!item.url) return;

    try {
      const preview = await this.linkPreviewService.generatePreview(item.url);

      item.title = preview.title;
      item.description = preview.description;
      item.imageUrl = preview.imageUrl;
      item.siteName = preview.siteName;
      item.price = preview.price || item.price;
      item.availability = preview.availability;
      item.previewCacheExpiry = preview.expiresAt;
    } catch (error) {
      this.logger.warn(
        `Failed to populate cached preview data for item ${item.id}:`,
        error,
      );
    }
  }
}
