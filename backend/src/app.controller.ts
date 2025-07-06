import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth(): { status: string; timestamp: string; service: string } {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: "Clara's Baby Registry API",
    };
  }

  @Get('api/baby-info')
  getBabyInfo() {
    return {
      name: this.configService.getOrThrow<string>('baby.name'),
      dueDate: this.configService.getOrThrow<string>('baby.dueDate'),
    };
  }
}
