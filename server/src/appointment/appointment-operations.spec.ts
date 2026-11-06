import { normalizeManualMeetingLink } from './appointment-operations';

describe('manual appointment operations', () => {
  it('accepts official secure Zoom meeting links', () => {
    expect(
      normalizeManualMeetingLink('https://us06web.zoom.us/j/123456789'),
    ).toBe('https://us06web.zoom.us/j/123456789');
  });

  it('accepts Google Meet meeting links', () => {
    expect(
      normalizeManualMeetingLink(' https://meet.google.com/abc-defg-hij '),
    ).toBe('https://meet.google.com/abc-defg-hij');
  });

  it('rejects other, lookalike and insecure meeting links', () => {
    expect(
      normalizeManualMeetingLink('https://zoom.us.example.com/j/123'),
    ).toBeNull();
    expect(normalizeManualMeetingLink('http://zoom.us/j/123')).toBeNull();
    expect(
      normalizeManualMeetingLink('http://meet.google.com/abc-defg-hij'),
    ).toBeNull();
    expect(
      normalizeManualMeetingLink(
        'https://meet.google.com.example.com/abc-defg-hij',
      ),
    ).toBeNull();
    expect(
      normalizeManualMeetingLink('https://meet.google.com/landing'),
    ).toBeNull();
    expect(normalizeManualMeetingLink('not-a-link')).toBeNull();
  });
});
