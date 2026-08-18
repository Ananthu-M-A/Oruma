export function normalizeManualZoomLink(value: string) {
  const link = value.trim();
  let url: URL;
  try {
    url = new URL(link);
  } catch {
    return null;
  }

  const hostname = url.hostname.toLowerCase();
  if (
    url.protocol !== 'https:' ||
    (hostname !== 'zoom.us' && !hostname.endsWith('.zoom.us'))
  ) {
    return null;
  }

  return url.toString();
}
