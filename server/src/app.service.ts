import { Injectable } from '@nestjs/common';

export type HealthStatus = {
  status: 'ok';
  service: string;
  environment: string;
  uptimeSeconds: number;
  timestamp: string;
};

@Injectable()
export class AppService {
  getHello(): string {
    return "Let's start with NestJS!";
  }

  getHealth(): HealthStatus {
    return {
      status: 'ok',
      service: 'oruma-api',
      environment: process.env.NODE_ENV ?? 'development',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}
