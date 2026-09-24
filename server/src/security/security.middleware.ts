import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

type RateLimitOptions = {
  windowMs: number;
  max: number;
  keyPrefix: string;
  message: string;
  skip?: (req: Request) => boolean;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitBuckets = new Map<string, RateLimitEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitBuckets.entries()) {
    if (entry.resetAt <= now) rateLimitBuckets.delete(key);
  }
}).unref();

export function securityHeaders() {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestId = getRequestId(req);
    (req as Request & { requestId?: string }).requestId = requestId;

    res.setHeader('X-Request-Id', requestId);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), payment=()',
    );
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'",
    );

    if (process.env.NODE_ENV === 'production') {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains',
      );
    }

    if (isSensitivePath(req.path)) {
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Pragma', 'no-cache');
    }

    next();
  };
}

export function originGuard(allowedOrigins: Set<string>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return next();
    }

    if (isWebhookRequest(req)) return next();

    const origin = req.headers.origin;
    if (!origin) return next();

    if (!allowedOrigins.has(origin)) {
      return res.status(403).json({ message: 'Origin is not allowed' });
    }

    next();
  };
}

export function rateLimit(options: RateLimitOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (options.skip?.(req)) return next();

    const max =
      Number.isFinite(options.max) && options.max > 0 ? options.max : 60;
    const now = Date.now();
    const key = `${options.keyPrefix}:${getClientIp(req)}`;
    const entry = rateLimitBuckets.get(key);

    if (!entry || entry.resetAt <= now) {
      rateLimitBuckets.set(key, {
        count: 1,
        resetAt: now + options.windowMs,
      });
      return next();
    }

    entry.count += 1;
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    res.setHeader('Retry-After', String(retryAfterSeconds));
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader(
      'X-RateLimit-Remaining',
      String(Math.max(0, max - entry.count)),
    );
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > max) {
      return res.status(429).json({ message: options.message });
    }

    next();
  };
}

export function requireProductionSecrets() {
  if (process.env.NODE_ENV !== 'production') return;

  const jwtSecret = process.env.JWT_SECRET;
  const clientOrigin = process.env.CLIENT_ORIGIN;
  const databaseSync = process.env.DATABASE_SYNC;
  const weakJwtSecrets = new Set(['dev-jwt-secret', 'change_me', 'changeme']);

  if (!jwtSecret || jwtSecret.length < 32 || weakJwtSecrets.has(jwtSecret)) {
    throw new Error(
      'Production requires JWT_SECRET to be set to a strong secret of at least 32 characters.',
    );
  }

  if (!clientOrigin || clientOrigin.includes('*')) {
    throw new Error('Production requires explicit CLIENT_ORIGIN values.');
  }

  const insecureOrigins = clientOrigin
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin && !origin.startsWith('https://'));

  if (insecureOrigins.length > 0) {
    throw new Error(
      `Production CLIENT_ORIGIN values must use https: ${insecureOrigins.join(', ')}`,
    );
  }

  if (databaseSync === 'true') {
    throw new Error('Production must not run with DATABASE_SYNC=true.');
  }

  const missingMediaSecrets = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_UPLOAD_PRESET',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ].filter((key) => !process.env[key]);
  if (missingMediaSecrets.length > 0) {
    throw new Error(
      `Production media management requires: ${missingMediaSecrets.join(', ')}`,
    );
  }

  const missingEmailSecrets = ['RESEND_API_KEY', 'EMAIL_FROM'].filter(
    (key) => !process.env[key]?.trim(),
  );
  if (missingEmailSecrets.length > 0) {
    throw new Error(
      `Production email delivery requires: ${missingEmailSecrets.join(', ')}`,
    );
  }

  const missingPaymentSecrets = [
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'RAZORPAY_WEBHOOK_SECRET',
  ].filter((key) => !process.env[key]?.trim());
  if (missingPaymentSecrets.length > 0) {
    throw new Error(
      `Production Razorpay processing requires: ${missingPaymentSecrets.join(', ')}`,
    );
  }
  if (!process.env.RAZORPAY_KEY_ID?.startsWith('rzp_live_')) {
    throw new Error(
      'Production Razorpay processing requires a Live Mode RAZORPAY_KEY_ID.',
    );
  }

  if (process.env.PROVIDER_WORKER_ENABLED === 'false') {
    throw new Error('Production requires PROVIDER_WORKER_ENABLED=true.');
  }
  if (process.env.RESERVATION_CLEANUP_ENABLED === 'false') {
    throw new Error('Production requires RESERVATION_CLEANUP_ENABLED=true.');
  }
  if (process.env.PAYMENT_BYPASS_ENABLED === 'true') {
    throw new Error('Production must not enable PAYMENT_BYPASS_ENABLED.');
  }
  if (process.env.BOOKING_LEAD_TIME_BYPASS_ENABLED === 'true') {
    throw new Error(
      'Production must not enable BOOKING_LEAD_TIME_BYPASS_ENABLED.',
    );
  }
}

function isWebhookRequest(req: Request) {
  return req.path === '/payments/razorpay/webhook';
}

function isSensitivePath(path: string) {
  return [
    '/auth',
    '/appointments',
    '/availability',
    '/case-sheets',
    '/media',
    '/notifications',
    '/payments',
    '/privacy',
    '/profile',
    '/tickets',
    '/user',
    '/users',
    '/admin',
  ].some((prefix) => path.startsWith(prefix));
}

function getRequestId(req: Request) {
  const requestId = req.headers['x-request-id'];

  return typeof requestId === 'string' && requestId.length <= 128
    ? requestId
    : randomUUID();
}

function getClientIp(req: Request) {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (process.env.TRUST_PROXY === 'true' && typeof forwardedFor === 'string') {
    return forwardedFor.split(',')[0].trim();
  }

  return req.ip || req.socket.remoteAddress || 'unknown';
}
