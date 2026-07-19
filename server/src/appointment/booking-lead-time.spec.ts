import {
  BOOKING_LEAD_TIME_MS,
  getBookingLeadTimeMs,
  isBookingLeadTimeBypassEnabled,
  isStartTimeBookable,
} from './booking-lead-time';

describe('booking lead time', () => {
  const now = new Date('2026-07-19T04:30:00.000Z');

  it('allows the exact 24-hour boundary and rejects earlier times', () => {
    const productionEnv = {
      NODE_ENV: 'production',
      BOOKING_LEAD_TIME_BYPASS_ENABLED: 'false',
    };

    expect(
      isStartTimeBookable(
        new Date(now.getTime() + BOOKING_LEAD_TIME_MS - 1),
        now,
        productionEnv,
      ),
    ).toBe(false);
    expect(
      isStartTimeBookable(
        new Date(now.getTime() + BOOKING_LEAD_TIME_MS),
        now,
        productionEnv,
      ),
    ).toBe(true);
  });

  it('allows developers to bypass the wait outside production', () => {
    const developmentEnv = {
      NODE_ENV: 'development',
      BOOKING_LEAD_TIME_BYPASS_ENABLED: 'true',
    };

    expect(isBookingLeadTimeBypassEnabled(developmentEnv)).toBe(true);
    expect(getBookingLeadTimeMs(developmentEnv)).toBe(0);
    expect(
      isStartTimeBookable(
        new Date(now.getTime() + 60_000),
        now,
        developmentEnv,
      ),
    ).toBe(true);
  });

  it('never permits the bypass in production', () => {
    const productionEnv = {
      NODE_ENV: 'production',
      BOOKING_LEAD_TIME_BYPASS_ENABLED: 'true',
    };

    expect(isBookingLeadTimeBypassEnabled(productionEnv)).toBe(false);
    expect(getBookingLeadTimeMs(productionEnv)).toBe(BOOKING_LEAD_TIME_MS);
  });
});
