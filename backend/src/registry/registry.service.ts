import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistryItem } from './entities/registry-item.entity';
import { CreateRegistryItemDto, UpdateRegistryItemDto } from './dto/registry.dto';

@Injectable()
export class RegistryService {
  constructor(
    @InjectRepository(RegistryItem)
    private registryItemsRepository: Repository<RegistryItem>,
  ) {}

  async getAllItems(): Promise<RegistryItem[]> {
    return this.registryItemsRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  async getItemById(id: string): Promise<RegistryItem> {
    const item = await this.registryItemsRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Registry item with ID ${id} not found`);
    }
    return item;
  }

  async createItem(createItemDto: CreateRegistryItemDto): Promise<RegistryItem> {
    const newItem = this.registryItemsRepository.create(createItemDto);
    return this.registryItemsRepository.save(newItem);
  }

  async updateItem(id: string, updateItemDto: UpdateRegistryItemDto): Promise<RegistryItem> {
    const item = await this.getItemById(id);
    Object.assign(item, updateItemDto);
    return this.registryItemsRepository.save(item);
  }

  async deleteItem(id: string): Promise<void> {
    const item = await this.getItemById(id);
    await this.registryItemsRepository.remove(item);
  }

  async togglePurchased(id: string): Promise<RegistryItem> {
    const item = await this.getItemById(id);
    item.purchased = !item.purchased;
    return this.registryItemsRepository.save(item);
  }
}
