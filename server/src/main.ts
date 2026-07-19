import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded, Request, type Application } from 'express';
import { AppModule } from './app.module';
import {
  originGuard,
  rateLimit,
  requireProductionSecrets,
  securityHeaders,
} from './security/security.middleware';
import { IST_TIME_ZONE } from './common/ist-date-time';

// Keep Date parsing for legacy PostgreSQL timestamp columns deterministic.
// API payloads still use ISO instants; customer-facing scheduling uses IST.
process.env.TZ = IST_TIME_ZONE;

async function bootstrap() {
  requireProductionSecrets();

  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    rawBody: true,
  });
  const clientOrigins = (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowedOrigins = new Set(clientOrigins);

  const expressApp = app.getHttpAdapter().getInstance() as Application;
  expressApp.disable('x-powered-by');

  if (process.env.TRUST_PROXY === 'true') {
    expressApp.set('trust proxy', 1);
  }

  app.use(
    json({
      limit: process.env.JSON_BODY_LIMIT ?? '1mb',
      verify: (req: Request & { rawBody?: Buffer }, _res, buffer) => {
        req.rawBody = buffer;
      },
    }),
  );
  app.use(
    urlencoded({
      extended: true,
      limit: process.env.FORM_BODY_LIMIT ?? '256kb',
      verify: (req: Request & { rawBody?: Buffer }, _res, buffer) => {
        req.rawBody = buffer;
      },
    }),
  );

  app.use(securityHeaders());
  app.use(originGuard(allowedOrigins));
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: Number(process.env.GLOBAL_RATE_LIMIT_PER_MINUTE ?? 300),
      keyPrefix: 'global',
      message: 'Too many requests. Please try again shortly.',
      skip: (req) => req.path === '/payments/razorpay/webhook',
    }),
  );
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: Number(process.env.AUTH_RATE_LIMIT_PER_15_MINUTES ?? 30),
      keyPrefix: 'auth',
      message: 'Too many authentication attempts. Please try again later.',
      skip: (req) => !req.path.startsWith('/auth'),
    }),
  );

  app.enableCors({
    origin: clientOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Requested-With'],
    maxAge: 600,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
