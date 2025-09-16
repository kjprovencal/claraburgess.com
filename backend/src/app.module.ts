import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RegistryModule } from './registry/registry.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { PhotosModule } from './photos/photos.module';
import { SeedModule } from './seed/seed.module';
import { BabyShowerModule } from './baby-shower/baby-shower.module';
import { getDatabaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        getDatabaseConfig(configService),
      inject: [ConfigService],
    }),
    RegistryModule,
    PhotosModule,
    AuthModule,
    AdminModule,
    SeedModule,
    BabyShowerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
