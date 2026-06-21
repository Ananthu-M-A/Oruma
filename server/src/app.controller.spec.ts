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
      expect(appController.getHealth()).toEqual(
        expect.objectContaining({
          status: 'ok',
          service: 'oruma-api',
          environment: expect.any(String),
          uptimeSeconds: expect.any(Number),
          timestamp: expect.any(String),
        }),
      );
    });
  });
});
