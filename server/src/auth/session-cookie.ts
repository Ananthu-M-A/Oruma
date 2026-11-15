import type { CookieOptions, Request, Response } from 'express';

export const SESSION_COOKIE_NAME = 'oruma_session';

type ConfigReader = { get<T = string>(key: string): T | undefined };

type SameSite = 'lax' | 'strict' | 'none';

/**
 * The access token lives in an httpOnly cookie, so page scripts (and any
 * injected script) cannot read it. oruma.me and api.oruma.me are the same
 * site, so SameSite=Lax works in production and blocks cross-site form posts.
 * A preview domain on another site (for example *.vercel.app) needs
 * SESSION_COOKIE_SAMESITE=none; CSRF is then covered by the origin guard.
 */
export function getSessionCookieOptions(config: ConfigReader): CookieOptions {
  const configured = config
    .get<string>('SESSION_COOKIE_SAMESITE')
    ?.trim()
    .toLowerCase();
  const sameSite: SameSite =
    configured === 'none' || configured === 'strict' ? configured : 'lax';
  const secure =
    sameSite === 'none' ||
    config.get<string>('NODE_ENV') === 'production' ||
    config.get<string>('SESSION_COOKIE_SECURE') === 'true';
  const domain = config.get<string>('SESSION_COOKIE_DOMAIN')?.trim();

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: '/',
    ...(domain ? { domain } : {}),
  };
}

/** Sets the session cookie to expire together with the token itself. */
export function setSessionCookie(
  res: Response,
  token: string,
  expiresAt: Date,
  config: ConfigReader,
) {
  res.cookie(SESSION_COOKIE_NAME, token, {
    ...getSessionCookieOptions(config),
    expires: expiresAt,
  });
}

export function clearSessionCookie(res: Response, config: ConfigReader) {
  res.clearCookie(SESSION_COOKIE_NAME, getSessionCookieOptions(config));
}

/** Reads one cookie without needing cookie-parser. */
export function readCookie(req: Pick<Request, 'headers'>, name: string) {
  const header = req.headers?.cookie;
  if (!header) return null;
  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator === -1) continue;
    if (part.slice(0, separator).trim() !== name) continue;
    const value = part.slice(separator + 1).trim();
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }
  return null;
}

export function readSessionCookie(req: Pick<Request, 'headers'>) {
  return readCookie(req, SESSION_COOKIE_NAME);
}
