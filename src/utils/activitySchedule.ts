import { Activity } from '../types';

export interface ActivityTimeRange {
  start: number;
  end: number;
}

/** Accepts schedules such as "05:00 - 06:00 WIB" or "05:00 sampai 06:00". */
export function parseActivityTime(value: string): ActivityTimeRange | null {
  const match = value.match(/(\d{1,2}):(\d{2})\s*(?:-|–|—|sampai|s\/d|to)\s*(\d{1,2}):(\d{2})/i);
  if (!match) return null;

  const [, startHour, startMinute, endHour, endMinute] = match;
  const sh = Number(startHour), sm = Number(startMinute);
  const eh = Number(endHour), em = Number(endMinute);
  if (sh > 23 || eh > 23 || sm > 59 || em > 59) return null;

  const start = sh * 60 + sm;
  const end = eh * 60 + em;
  return start === end ? null : { start, end };
}

export function jakartaMinutes(now = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(now);
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? 0);
  return hour * 60 + minute;
}

export function isActivityOpen(time: string, now = new Date()): boolean {
  const range = parseActivityTime(time);
  if (!range) return false;
  const current = jakartaMinutes(now);
  return range.start < range.end
    ? current >= range.start && current < range.end
    : current >= range.start || current < range.end;
}

export function getActivityStatus(time: string, now = new Date()): Activity['status'] {
  const range = parseActivityTime(time);
  if (!range) return 'Akan Datang';
  if (isActivityOpen(time, now)) return 'Sedang Berlangsung';
  const current = jakartaMinutes(now);
  const upcoming = range.start < range.end && current < range.start;
  return upcoming ? 'Akan Datang' : 'Selesai';
}
