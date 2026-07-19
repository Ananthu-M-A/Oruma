export const BOOKING_LEAD_TIME_HOURS = 24;
export const BOOKING_LEAD_TIME_MS = BOOKING_LEAD_TIME_HOURS * 60 * 60 * 1000;

type BookingLeadTimeEnv = {
  NODE_ENV?: string;
  BOOKING_LEAD_TIME_BYPASS_ENABLED?: string;
};

export function isBookingLeadTimeBypassEnabled(
  env: BookingLeadTimeEnv = process.env,
) {
  return (
    env.NODE_ENV !== 'production' &&
    env.BOOKING_LEAD_TIME_BYPASS_ENABLED === 'true'
  );
}

export function getBookingLeadTimeMs(env: BookingLeadTimeEnv = process.env) {
  return isBookingLeadTimeBypassEnabled(env) ? 0 : BOOKING_LEAD_TIME_MS;
}

export function getEarliestBookableStartTime(
  now = new Date(),
  env: BookingLeadTimeEnv = process.env,
) {
  return new Date(now.getTime() + getBookingLeadTimeMs(env));
}

export function isStartTimeBookable(
  startTime: Date,
  now = new Date(),
  env: BookingLeadTimeEnv = process.env,
) {
  return (
    startTime.getTime() >= getEarliestBookableStartTime(now, env).getTime()
  );
}
