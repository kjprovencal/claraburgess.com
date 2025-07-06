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
} from '@nestjs/common';
import { RegistryService } from './registry.service';
import {
  CreateRegistryItemDto,
  UpdateRegistryItemDto,
} from './dto/registry.dto';

@Controller('api/registry')
export class RegistryController {
  constructor(private readonly registryService: RegistryService) {}

  @Get()
  async getAllItems() {
    return this.registryService.getAllItems();
  }

  @Get(':id')
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
}
