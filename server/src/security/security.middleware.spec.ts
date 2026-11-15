import type { Request } from 'express';
import {
  getClientIp,
  originGuard,
  rateLimit,
  requireProductionSecrets,
} from './security.middleware';

describe('requireProductionSecrets', () => {
  const keys = [
    'NODE_ENV',
    'JWT_SECRET',
    'CLIENT_ORIGIN',
    'DATABASE_SYNC',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_UPLOAD_PRESET',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'RESEND_API_KEY',
    'EMAIL_FROM',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'RAZORPAY_WEBHOOK_SECRET',
    'PROVIDER_WORKER_ENABLED',
    'RESERVATION_CLEANUP_ENABLED',
    'PAYMENT_BYPASS_ENABLED',
    'BOOKING_LEAD_TIME_BYPASS_ENABLED',
  ] as const;
  const previous = new Map<string, string | undefined>();

  beforeEach(() => {
    for (const key of keys) previous.set(key, process.env[key]);
    Object.assign(process.env, {
      NODE_ENV: 'production',
      JWT_SECRET: 'a-strong-production-secret-with-32-chars',
      CLIENT_ORIGIN: 'https://oruma.me',
      DATABASE_SYNC: 'false',
      CLOUDINARY_CLOUD_NAME: 'cloud',
      CLOUDINARY_UPLOAD_PRESET: 'preset',
      CLOUDINARY_API_KEY: 'media-key',
      CLOUDINARY_API_SECRET: 'media-secret',
      RESEND_API_KEY: 'resend-key',
      EMAIL_FROM: 'Oruma <support@oruma.me>',
      RAZORPAY_KEY_ID: 'rzp_live_key',
      RAZORPAY_KEY_SECRET: 'payment-secret',
      RAZORPAY_WEBHOOK_SECRET: 'webhook-secret',
      PROVIDER_WORKER_ENABLED: 'true',
      RESERVATION_CLEANUP_ENABLED: 'true',
      PAYMENT_BYPASS_ENABLED: 'false',
      BOOKING_LEAD_TIME_BYPASS_ENABLED: 'false',
    });
  });

  afterEach(() => {
    for (const key of keys) {
      const value = previous.get(key);
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    previous.clear();
  });

  it('accepts a fully configured production environment', () => {
    expect(() => requireProductionSecrets()).not.toThrow();
  });

  it.each([
    ['RESEND_API_KEY', 'Production email delivery requires'],
    ['RAZORPAY_WEBHOOK_SECRET', 'Production Razorpay processing requires'],
  ])('rejects production when %s is missing', (key, message) => {
    delete process.env[key];
    expect(() => requireProductionSecrets()).toThrow(message);
  });

  it('rejects Razorpay Test Mode credentials in production', () => {
    process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
    expect(() => requireProductionSecrets()).toThrow(
      'Live Mode RAZORPAY_KEY_ID',
    );
  });

  it('rejects disabled delivery and reservation workers', () => {
    process.env.PROVIDER_WORKER_ENABLED = 'false';
    expect(() => requireProductionSecrets()).toThrow(
      'PROVIDER_WORKER_ENABLED=true',
    );
    process.env.PROVIDER_WORKER_ENABLED = 'true';
    process.env.RESERVATION_CLEANUP_ENABLED = 'false';
    expect(() => requireProductionSecrets()).toThrow(
      'RESERVATION_CLEANUP_ENABLED=true',
    );
  });
});

describe('getClientIp', () => {
  it('uses the proxy-resolved req.ip, not a forged X-Forwarded-For', () => {
    const req = {
      ip: '203.0.113.7',
      headers: { 'x-forwarded-for': '1.2.3.4, 203.0.113.7' },
      socket: { remoteAddress: '10.0.0.1' },
    } as unknown as Request;
    expect(getClientIp(req)).toBe('203.0.113.7');
  });
});

describe('originGuard', () => {
  const run = (headers: Record<string, string>, method = 'POST') => {
    const req = { method, headers, path: '/tickets' } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();
    originGuard(new Set(['https://oruma.me']))(req, res as never, next);
    return { res, next };
  };

  it('refuses a cookie-authenticated write without an Origin (CSRF)', () => {
    const { res, next } = run({ cookie: 'oruma_session=abc' });
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('allows a cookie write from the site and refuses other origins', () => {
    expect(
      run({ cookie: 'oruma_session=abc', origin: 'https://oruma.me' }).next,
    ).toHaveBeenCalled();
    expect(
      run({ cookie: 'oruma_session=abc', origin: 'https://evil.example' }).res
        .status,
    ).toHaveBeenCalledWith(403);
  });

  it('still allows Bearer API clients that send no Origin', () => {
    expect(run({ authorization: 'Bearer token' }).next).toHaveBeenCalled();
  });
});

describe('rateLimit', () => {
  it('blocks once the store reports more hits than the limit', async () => {
    const store = {
      hit: jest
        .fn()
        .mockResolvedValueOnce({ count: 2, resetAt: Date.now() + 1000 })
        .mockResolvedValueOnce({ count: 3, resetAt: Date.now() + 1000 }),
    };
    const middleware = rateLimit({
      windowMs: 1000,
      max: 2,
      keyPrefix: 'auth',
      message: 'Slow down',
      store,
    });
    const makeRes = () => ({
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    });
    const req = { ip: '203.0.113.7', headers: {} } as unknown as Request;

    const allowed = jest.fn();
    middleware(req, makeRes() as never, allowed);
    await new Promise((resolve) => setImmediate(resolve));
    expect(allowed).toHaveBeenCalledWith();

    const blockedRes = makeRes();
    const blocked = jest.fn();
    middleware(req, blockedRes as never, blocked);
    await new Promise((resolve) => setImmediate(resolve));
    expect(blocked).not.toHaveBeenCalled();
    expect(blockedRes.status).toHaveBeenCalledWith(429);
    expect(store.hit).toHaveBeenCalledWith('auth:203.0.113.7', 1000);
  });
});
