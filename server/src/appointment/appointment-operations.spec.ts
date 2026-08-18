import { normalizeManualZoomLink } from './appointment-operations';

describe('manual appointment operations', () => {
  it('accepts official secure Zoom meeting links', () => {
    expect(normalizeManualZoomLink('https://us06web.zoom.us/j/123456789')).toBe(
      'https://us06web.zoom.us/j/123456789',
    );
  });

  it('rejects non-Zoom and insecure meeting links', () => {
    expect(
      normalizeManualZoomLink('https://zoom.us.example.com/j/123'),
    ).toBeNull();
    expect(normalizeManualZoomLink('http://zoom.us/j/123')).toBeNull();
    expect(normalizeManualZoomLink('not-a-link')).toBeNull();
  });
});
