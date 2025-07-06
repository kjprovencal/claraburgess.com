import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'sqlite',
  database: join(process.cwd(), configService.get<string>('database.database') || 'database.sqlite'),
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  synchronize: configService.get<boolean>('database.synchronize'),
  logging: configService.get<boolean>('database.logging'),
});
