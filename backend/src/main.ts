import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const frontendUrl = configService.getOrThrow<string>('FRONTEND_URL');
  // Enable CORS for frontend
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  const port = configService.getOrThrow<number>('PORT');
  await app.listen(port);

  console.log(`🚀 Backend server running on port ${port}`);
  console.log(`📊 Health check available at http://localhost:${port}/health`);
  console.log(`🌍 Frontend URL: ${frontendUrl}`);
  console.log(`🔐 Admin login: admin/admin123`);
  console.log(`🌱 Database will be seeded automatically on startup`);
}
bootstrap();
