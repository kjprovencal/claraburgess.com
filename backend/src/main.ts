import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  
  // Enable CORS for frontend
  app.enableCors(configService.get('cors'));
  
  const port = configService.get<number>('port') || 3001;
  await app.listen(port);
  
  console.log(`🚀 Backend server running on port ${port}`);
  console.log(`📊 Health check available at http://localhost:${port}/health`);
  console.log(`🌍 Frontend URL: ${configService.get<string>('frontendUrl')}`);
  console.log(`🔐 Admin login: admin/admin123`);
  console.log(`🌱 Database will be seeded automatically on startup`);
}
bootstrap();
