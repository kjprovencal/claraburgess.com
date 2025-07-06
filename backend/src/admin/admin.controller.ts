import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RegistryService } from '../registry/registry.service';
import {
  CreateRegistryItemDto,
  UpdateRegistryItemDto,
} from '../registry/dto/registry.dto';

@Controller('api/admin/registry')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly registryService: RegistryService) {}

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
}
