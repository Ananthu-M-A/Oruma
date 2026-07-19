export const IST_TIME_ZONE = 'Asia/Kolkata';

export function formatIstSlotRange(start: Date, end: Date) {
  const date = start.toLocaleDateString('en-IN', {
    timeZone: IST_TIME_ZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const timeOptions: Intl.DateTimeFormatOptions = {
    timeZone: IST_TIME_ZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  return `${date}, ${start.toLocaleTimeString('en-IN', timeOptions)} - ${end.toLocaleTimeString('en-IN', timeOptions)} IST`;
}
