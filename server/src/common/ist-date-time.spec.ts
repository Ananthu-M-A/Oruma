import { formatIstSlotRange } from './ist-date-time';

describe('IST date and time formatting', () => {
  it('formats an absolute slot in Asia/Kolkata regardless of server locale', () => {
    const result = formatIstSlotRange(
      new Date('2026-07-19T04:30:00.000Z'),
      new Date('2026-07-19T05:30:00.000Z'),
    );

    expect(result).toContain('10:00 am');
    expect(result).toContain('11:00 am');
    expect(result).toContain('IST');
  });
});
