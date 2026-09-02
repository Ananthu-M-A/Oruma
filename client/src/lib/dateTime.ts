export const IST_TIME_ZONE = "Asia/Kolkata";
export const IST_OFFSET_MINUTES = 330;

type DateValue = Date | number | string;

function asValidDate(value: DateValue) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatIstDateTime(
  value: DateValue | null | undefined,
  fallback = "Time to be confirmed",
) {
  if (value === null || value === undefined || value === "") return fallback;
  const date = asValidDate(value);
  if (!date) return fallback;

  return `${date.toLocaleString("en-IN", {
    timeZone: IST_TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })} IST`;
}

export function formatIstDate(
  value: DateValue | null | undefined,
  fallback = "Date to be confirmed",
) {
  if (value === null || value === undefined || value === "") return fallback;
  const date = asValidDate(value);
  if (!date) return fallback;

  return date.toLocaleDateString("en-IN", {
    timeZone: IST_TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatIstTime(
  value: DateValue | null | undefined,
  fallback = "Time",
) {
  if (value === null || value === undefined || value === "") return fallback;
  const date = asValidDate(value);
  if (!date) return fallback;

  return date.toLocaleTimeString("en-IN", {
    timeZone: IST_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatIstSlotRange(
  startValue: DateValue | null | undefined,
  endValue: DateValue | null | undefined,
  fallback = "Time to be confirmed",
) {
  if (startValue === null || startValue === undefined) return fallback;
  if (endValue === null || endValue === undefined) return fallback;
  const start = asValidDate(startValue);
  const end = asValidDate(endValue);
  if (!start || !end) return fallback;

  return `${formatIstDate(start)}, ${formatIstTime(start)} - ${formatIstTime(end)} IST`;
}

/** Converts an absolute timestamp into a value suitable for an IST datetime-local input. */
export function toIstDateTimeInputValue(value: DateValue) {
  const date = asValidDate(value);
  if (!date) return "";

  return new Date(date.getTime() + IST_OFFSET_MINUTES * 60_000)
    .toISOString()
    .slice(0, 16);
}

/** Interprets a timezone-less datetime-local value as Asia/Kolkata time. */
export function fromIstDateTimeInputValue(value: string) {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );
  if (!match) throw new Error("Enter a valid date and time in IST.");

  const [, year, month, day, hour, minute, second = "00"] = match;
  const date = new Date(
    `${year}-${month}-${day}T${hour}:${minute}:${second}+05:30`,
  );
  if (Number.isNaN(date.getTime())) {
    throw new Error("Enter a valid date and time in IST.");
  }

  return date.toISOString();
}

export function addMinutesToIstInput(value: string, minutes: number) {
  if (!value) return "";
  const date = new Date(fromIstDateTimeInputValue(value));
  return toIstDateTimeInputValue(date.getTime() + minutes * 60_000);
}

function getIstDateKey(value: DateValue) {
  const date = asValidDate(value);
  if (!date) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function isTomorrowInIst(value: DateValue) {
  return getIstDateKey(value) === getIstDateKey(Date.now() + 86_400_000);
}
