function isZoomHost(hostname: string) {
  return hostname === 'zoom.us' || hostname.endsWith('.zoom.us');
}

// Google Meet codes look like abc-defg-hij.
const GOOGLE_MEET_PATH = /^\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/i;

/**
 * Validates a meeting link pasted by staff. Accepts official HTTPS Zoom links
 * and Google Meet meeting links; rejects everything else.
 */
export function normalizeManualMeetingLink(value: string) {
  const link = value.trim();
  let url: URL;
  try {
    url = new URL(link);
  } catch {
    return null;
  }

  if (url.protocol !== 'https:') return null;
  const hostname = url.hostname.toLowerCase();
  if (isZoomHost(hostname)) return url.toString();
  if (hostname === 'meet.google.com' && GOOGLE_MEET_PATH.test(url.pathname)) {
    return url.toString();
  }
  return null;
}
