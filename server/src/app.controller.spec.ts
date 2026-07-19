import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return the app welcome message', () => {
      expect(appController.getHello()).toBe("Let's start with NestJS!");
    });
  });

  describe('health', () => {
    it('should return an ok health response', () => {
      const health = appController.getHealth();

      expect(health.status).toBe('ok');
      expect(health.service).toBe('oruma-api');
      expect(typeof health.environment).toBe('string');
      expect(typeof health.uptimeSeconds).toBe('number');
      expect(typeof health.timestamp).toBe('string');
    });
  });
});
