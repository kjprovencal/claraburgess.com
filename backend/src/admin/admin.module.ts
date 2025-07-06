import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { RegistryModule } from '../registry/registry.module';

@Module({
  imports: [RegistryModule],
  controllers: [AdminController],
})
export class AdminModule {}
