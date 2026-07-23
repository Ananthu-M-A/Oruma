import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('ready')
export class ReadinessController {
  constructor(private readonly dataSource: DataSource) {}
  @Get()
  async ready() {
    try {
      await this.dataSource.query('SELECT 1');
      return {
        status: 'ready',
        database: 'available',
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'not_ready',
        database: 'unavailable',
      });
    }
  }
}
