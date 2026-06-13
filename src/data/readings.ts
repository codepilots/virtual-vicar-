// Lectionary readings keyed by liturgical-day `id` and RCL year.
//
// SCAFFOLD: ships a small seed plus a link-out to the official lectionary so
// every day resolves. Each reading is a structured scripture reference that the
// Bible-link layer can turn into a deep link to the user's chosen Bible site.

import type { LiturgicalDay } from './calendar';

export interface ScriptureRef {
  /** Canonical book name, e.g. "1 Corinthians". */
  book: string;
  /** Passage as printed, e.g. "13.1–13" or "1-13". */
  passage: string;
  /** Optional label, e.g. "Old Testament", "Psalm", "Gospel". */
  label?: string;
}

export interface DayReadings {
  /** Principal Service readings for the day. */
  principal: ScriptureRef[];
  /** Optional alternative / Second Service readings. */
  secondService?: ScriptureRef[];
}

// Seed examples. Key format: `${day.id}:${rclYear}` for Sunday-cycle days, or
// `${day.id}` for fixed feasts that do not vary by year.
export const READINGS: Record<string, DayReadings> = {
  'christmas-day': {
    principal: [
      { book: 'Isaiah', passage: '9.2-7', label: 'Old Testament' },
      { book: 'Psalm', passage: '96', label: 'Psalm' },
      { book: 'Titus', passage: '2.11-14', label: 'New Testament' },
      { book: 'Luke', passage: '2.1-14', label: 'Gospel' },
    ],
  },
  'trinity-sunday:A': {
    principal: [
      { book: 'Isaiah', passage: '40.12-17,27-31', label: 'Old Testament' },
      { book: 'Psalm', passage: '8', label: 'Psalm' },
      { book: '2 Corinthians', passage: '13.11-13', label: 'New Testament' },
      { book: 'Matthew', passage: '28.16-20', label: 'Gospel' },
    ],
  },
};

/**
 * Deep-link to the official Church of England Daily Prayer page for the date,
 * which carries that day's psalms and readings. The C of E retired the old
 * `…/prayer-during-day/lectionary?date=` URL (it now lands on a site search),
 * but publishes each office at a stable per-date address like
 * `…/join-us-in-daily-prayer/morning-prayer-contemporary-tuesday-16-june-2026`.
 * Note these are the Daily Office readings; principal-service (RCL) readings
 * for Sundays are filled from LectServe/the local table before this fallback.
 */
export function officialLectionaryUrl(
  day: LiturgicalDay,
  timeOfDay: 'morning' | 'day' | 'evening' | 'night' | 'any' = 'any',
  traditional = false,
): string {
  const office =
    timeOfDay === 'evening'
      ? 'evening-prayer'
      : timeOfDay === 'night'
        ? 'night-prayer'
        : timeOfDay === 'day'
          ? 'prayer-during-the-day'
          : 'morning-prayer';
  // Only Morning and Evening Prayer have contemporary/traditional variants in
  // the URL; Prayer During the Day and Night Prayer do not.
  const hasStyle = timeOfDay === 'morning' || timeOfDay === 'evening' || timeOfDay === 'any';
  const stylePart = hasStyle ? `${traditional ? 'traditional' : 'contemporary'}-` : '';
  const d = day.date;
  const weekday = d.toLocaleDateString('en-GB', { weekday: 'long' }).toLowerCase();
  const month = d.toLocaleDateString('en-GB', { month: 'long' }).toLowerCase();
  return `https://www.churchofengland.org/prayer-and-worship/join-us-in-daily-prayer/${office}-${stylePart}${weekday}-${d.getDate()}-${month}-${d.getFullYear()}`;
}

export function getReadings(day: LiturgicalDay): DayReadings | undefined {
  return READINGS[`${day.id}:${day.rclYear}`] ?? READINGS[day.id];
}
