// Liturgical calendar engine for the Church of England (Common Worship).
//
// Computes the date of Easter, the liturgical season, the name of the
// Sunday / Principal Feast, the Revised Common Lectionary year (A/B/C) used
// for Sunday Principal Services, and the Daily Lectionary year (1/2) used for
// Morning and Evening Prayer on weekdays.
//
// This is intentionally dependency-free and deterministic so it works
// offline. It aims to be correct for the great majority of ordinary Sundays
// and the major Principal Feasts; some lesser commemorations are not
// distinguished and simply fall back to the seasonal day.

export type Season =
  | 'Advent'
  | 'Christmas'
  | 'Epiphany'
  | 'Ordinary Time before Lent'
  | 'Lent'
  | 'Passiontide'
  | 'Easter'
  | 'Ordinary Time after Trinity';

export interface LiturgicalDay {
  /** The supplied calendar date (local). */
  date: Date;
  /** Human readable date, e.g. "Sunday 14 June 2026". */
  dateLabel: string;
  /** Liturgical season. */
  season: Season;
  /** Liturgical colour (a sensible default for the day). */
  colour: 'White' | 'Red' | 'Purple' | 'Green' | 'Rose' | 'Gold';
  /** Name of the day, e.g. "The Second Sunday after Trinity". */
  name: string;
  /** A stable id used to look up collects and readings. */
  id: string;
  /** True if the day is a Sunday or a Principal Feast. */
  isSundayOrFeast: boolean;
  /** RCL year for Sunday Principal Services. */
  rclYear: 'A' | 'B' | 'C';
  /** Daily Office lectionary year. */
  dailyYear: 1 | 2;
  /** Proper number (Ordinary Time after Trinity), if applicable. */
  proper?: number;
}

const DAY_MS = 86_400_000;

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * DAY_MS);
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY_MS);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Anonymous Gregorian computus — date of Easter Sunday for a given year. */
export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = March, 4 = April
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/** The Sunday on or before the given date. */
function previousSunday(d: Date): Date {
  return addDays(startOfDay(d), -d.getDay());
}

/** Advent Sunday — the fourth Sunday before Christmas Day. */
export function adventSunday(year: number): Date {
  const christmas = new Date(year, 11, 25);
  // Sunday on or before Christmas, then back three more Sundays.
  return addDays(previousSunday(christmas), -21);
}

const ORDINALS = [
  'First',
  'Second',
  'Third',
  'Fourth',
  'Fifth',
  'Sixth',
  'Seventh',
  'Eighth',
  'Ninth',
  'Tenth',
  'Eleventh',
  'Twelfth',
  'Thirteenth',
  'Fourteenth',
  'Fifteenth',
  'Sixteenth',
  'Seventeenth',
  'Eighteenth',
  'Nineteenth',
  'Twentieth',
  'Twenty-first',
  'Twenty-second',
  'Twenty-third',
  'Twenty-fourth',
  'Twenty-fifth',
];

function ordinal(n: number): string {
  return ORDINALS[n - 1] ?? `${n}th`;
}

/**
 * Determine the RCL year. The liturgical year that begins on Advent Sunday of
 * civil year Y is Year A when Y ≡ 0 (mod 3), B when ≡ 1, C when ≡ 2.
 */
function rclYearFor(adventStartYear: number): 'A' | 'B' | 'C' {
  return (['A', 'B', 'C'] as const)[((adventStartYear % 3) + 3) % 3];
}

/** Format like "Sunday 14 June 2026". */
function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * The proper number for Ordinary Time after Trinity is keyed to the calendar
 * date: Proper n is used on the Sunday falling within a fixed week of the year.
 * Common Worship defines Propers 4–25 by the date range in which the Sunday
 * falls. We map the Sunday's date to its Proper.
 */
function properForDate(sunday: Date): number | undefined {
  // Common Worship: Proper 4 = Sunday between 29 May and 4 June, and each
  // subsequent Proper one week later. Proper 25 = Sunday between 30 Oct–5 Nov.
  const ranges: { proper: number; start: [number, number]; end: [number, number] }[] = [
    { proper: 4, start: [4, 29], end: [5, 4] },
    { proper: 5, start: [5, 5], end: [5, 11] },
    { proper: 6, start: [5, 12], end: [5, 18] },
    { proper: 7, start: [5, 19], end: [5, 25] },
    { proper: 8, start: [5, 26], end: [6, 2] },
    { proper: 9, start: [6, 3], end: [6, 9] },
    { proper: 10, start: [6, 10], end: [6, 16] },
    { proper: 11, start: [6, 17], end: [6, 23] },
    { proper: 12, start: [6, 24], end: [6, 30] },
    { proper: 13, start: [7, 31], end: [7, 6] }, // 31 Jul–6 Aug
    { proper: 14, start: [7, 7], end: [7, 13] },
    { proper: 15, start: [7, 14], end: [7, 20] },
    { proper: 16, start: [7, 21], end: [7, 27] },
    { proper: 17, start: [7, 28], end: [8, 3] },
    { proper: 18, start: [8, 4], end: [8, 10] },
    { proper: 19, start: [8, 11], end: [8, 17] },
    { proper: 20, start: [8, 18], end: [8, 24] },
    { proper: 21, start: [8, 25], end: [9, 1] },
    { proper: 22, start: [9, 2], end: [9, 8] },
    { proper: 23, start: [9, 9], end: [9, 15] },
    { proper: 24, start: [9, 16], end: [9, 22] },
    { proper: 25, start: [9, 23], end: [10, 5] },
  ];
  const m = sunday.getMonth();
  const day = sunday.getDate();
  const cmp = (a: [number, number], b: [number, number]) =>
    a[0] === b[0] ? a[1] - b[1] : a[0] - b[0];
  for (const r of ranges) {
    // Handle ranges that span a month boundary correctly.
    const within =
      cmp([m, day], r.start) >= 0 &&
      (cmp(r.start, r.end) <= 0
        ? cmp([m, day], r.end) <= 0
        : cmp([m, day], r.end) <= 0 || cmp([m, day], r.start) >= 0);
    if (within) return r.proper;
  }
  return undefined;
}

/** Compute the liturgical day for an arbitrary calendar date. */
export function getLiturgicalDay(input: Date): LiturgicalDay {
  const date = startOfDay(input);
  const year = date.getFullYear();
  const dateLabel = formatDate(date);

  const easter = easterSunday(year);
  const adventThis = adventSunday(year);

  // Which liturgical year are we in? It begins on Advent Sunday.
  const inNewYear = daysBetween(adventThis, date) >= 0;
  const adventStartYear = inNewYear ? year : year - 1;
  const rclYear = rclYearFor(adventStartYear);
  // Daily Office Year 1 begins on Advent Sunday in even-numbered civil years.
  const dailyYear: 1 | 2 = adventStartYear % 2 === 0 ? 1 : 2;

  const dow = date.getDay(); // 0 = Sunday
  const isSunday = dow === 0;

  // Key fixed and movable dates.
  const ashWednesday = addDays(easter, -46);
  const palmSunday = addDays(easter, -7);
  const ascension = addDays(easter, 39);
  const pentecost = addDays(easter, 49);
  const trinity = addDays(easter, 56);
  const christmasDay = new Date(year, 11, 25);
  const epiphany = new Date(year, 0, 6);
  const presentation = new Date(year, 1, 2); // Candlemas

  const result = (
    partial: Omit<
      LiturgicalDay,
      'date' | 'dateLabel' | 'rclYear' | 'dailyYear' | 'isSundayOrFeast'
    > & { isSundayOrFeast?: boolean },
  ): LiturgicalDay => ({
    date,
    dateLabel,
    rclYear,
    dailyYear,
    isSundayOrFeast: partial.isSundayOrFeast ?? isSunday,
    ...partial,
  });

  // ---- Principal Feasts on fixed/movable dates ----
  if (isSameDay(date, christmasDay))
    return result({ season: 'Christmas', colour: 'Gold', name: 'Christmas Day', id: 'christmas-day', isSundayOrFeast: true });
  if (isSameDay(date, epiphany))
    return result({ season: 'Epiphany', colour: 'Gold', name: 'The Epiphany', id: 'epiphany', isSundayOrFeast: true });
  if (isSameDay(date, presentation))
    return result({ season: 'Epiphany', colour: 'Gold', name: 'The Presentation of Christ (Candlemas)', id: 'candlemas', isSundayOrFeast: true });
  if (isSameDay(date, ashWednesday))
    return result({ season: 'Lent', colour: 'Purple', name: 'Ash Wednesday', id: 'ash-wednesday', isSundayOrFeast: true });
  if (isSameDay(date, palmSunday))
    return result({ season: 'Passiontide', colour: 'Red', name: 'Palm Sunday', id: 'palm-sunday', isSundayOrFeast: true });
  if (isSameDay(date, addDays(easter, -3)))
    return result({ season: 'Passiontide', colour: 'White', name: 'Maundy Thursday', id: 'maundy-thursday', isSundayOrFeast: true });
  if (isSameDay(date, addDays(easter, -2)))
    return result({ season: 'Passiontide', colour: 'Red', name: 'Good Friday', id: 'good-friday', isSundayOrFeast: true });
  if (isSameDay(date, easter))
    return result({ season: 'Easter', colour: 'Gold', name: 'Easter Day', id: 'easter-day', isSundayOrFeast: true });
  if (isSameDay(date, ascension))
    return result({ season: 'Easter', colour: 'Gold', name: 'Ascension Day', id: 'ascension-day', isSundayOrFeast: true });
  if (isSameDay(date, pentecost))
    return result({ season: 'Easter', colour: 'Red', name: 'Day of Pentecost (Whit Sunday)', id: 'pentecost', isSundayOrFeast: true });
  if (isSameDay(date, trinity))
    return result({ season: 'Ordinary Time after Trinity', colour: 'White', name: 'Trinity Sunday', id: 'trinity-sunday', isSundayOrFeast: true });

  // ---- Seasonal blocks ----

  // Advent: Advent Sunday → Christmas Eve.
  if (daysBetween(adventThis, date) >= 0 && date < christmasDay) {
    const week = Math.floor(daysBetween(adventThis, date) / 7) + 1;
    return result({
      season: 'Advent',
      colour: 'Purple',
      name: isSunday ? `The ${ordinal(week)} Sunday of Advent` : `${ordinal(week)} week of Advent`,
      id: isSunday ? `advent-${week}` : `advent-week-${week}`,
    });
  }
  // Late December (after Christmas, before year end) belongs to the previous
  // Advent's liturgical year.
  if (date > christmasDay) {
    return result({ season: 'Christmas', colour: 'White', name: 'Christmastide', id: 'christmas-1' });
  }

  // We are in Jan–Nov of the civil year; the previous Advent began the year.
  // Christmas season: 1–5 January.
  if (date < epiphany) {
    return result({ season: 'Christmas', colour: 'White', name: 'Christmastide', id: 'christmas-2' });
  }

  // Epiphany season: 6 Jan → Candlemas (2 Feb).
  if (date >= epiphany && date < presentation) {
    // Sundays of Epiphany numbered from the Baptism of Christ.
    const firstSundayAfterEpiphany = addDays(previousSunday(addDays(epiphany, 6)), 0);
    if (isSameDay(date, addDays(previousSunday(addDays(epiphany, 7)), 0)) && date > epiphany) {
      // not exact; fall through to generic numbering below
    }
    const baptism = addDays(previousSunday(addDays(epiphany, 7)), 0);
    if (isSameDay(date, baptism))
      return result({ season: 'Epiphany', colour: 'White', name: 'The Baptism of Christ', id: 'baptism-of-christ', isSundayOrFeast: true });
    const week = Math.max(1, Math.floor(daysBetween(firstSundayAfterEpiphany, date) / 7) + 1);
    return result({
      season: 'Epiphany',
      colour: 'White',
      name: isSunday ? `The ${ordinal(week)} Sunday of Epiphany` : 'Epiphany season',
      id: isSunday ? `epiphany-${week}` : 'epiphany-weekday',
    });
  }

  // Ordinary Time before Lent: Candlemas → Ash Wednesday.
  if (date >= presentation && date < ashWednesday) {
    // Numbered as "Sundays before Lent" counting back from Ash Wednesday.
    const sundaysToLent = Math.ceil(daysBetween(date, ashWednesday) / 7);
    return result({
      season: 'Ordinary Time before Lent',
      colour: 'Green',
      name: isSunday
        ? sundaysToLent <= 4
          ? `The ${ordinal(sundaysToLent)} Sunday before Lent`
          : 'Ordinary Time'
        : 'Ordinary Time',
      id: isSunday ? `before-lent-${Math.min(sundaysToLent, 4)}` : 'ordinary-before-lent',
    });
  }

  // Lent: Ash Wednesday → Palm Sunday (exclusive).
  if (date > ashWednesday && date < palmSunday) {
    const lent1 = addDays(previousSunday(addDays(ashWednesday, 7)), 0);
    const week = Math.floor(daysBetween(lent1, date) / 7) + 1;
    return result({
      season: week >= 5 ? 'Passiontide' : 'Lent',
      colour: 'Purple',
      name: isSunday ? `The ${ordinal(week)} Sunday of Lent` : `${ordinal(week)} week of Lent`,
      id: isSunday ? `lent-${week}` : `lent-week-${week}`,
    });
  }

  // Holy Week (between Palm Sunday and Easter, not a named feast above).
  if (date > palmSunday && date < easter) {
    return result({ season: 'Passiontide', colour: 'Red', name: 'Holy Week', id: 'holy-week' });
  }

  // Eastertide: Easter Day → Pentecost (exclusive).
  if (date > easter && date < pentecost) {
    const week = Math.floor(daysBetween(easter, date) / 7) + 1;
    if (isSameDay(date, addDays(easter, 7)))
      return result({ season: 'Easter', colour: 'White', name: 'The Second Sunday of Easter', id: 'easter-2', isSundayOrFeast: true });
    return result({
      season: 'Easter',
      colour: 'White',
      name: isSunday ? `The ${ordinal(week)} Sunday of Easter` : 'Eastertide',
      id: isSunday ? `easter-${week}` : 'easter-weekday',
    });
  }

  // Ordinary Time after Trinity: Trinity Sunday → Advent Sunday.
  if (date > trinity && date < adventThis) {
    // Christ the King is the Sunday before Advent.
    if (isSunday && daysBetween(date, adventThis) <= 7)
      return result({
        season: 'Ordinary Time after Trinity',
        colour: 'White',
        name: 'Christ the King (Sunday next before Advent)',
        id: 'christ-the-king',
        isSundayOrFeast: true,
      });
    const sunday = isSunday ? date : previousSunday(date);
    const proper = properForDate(sunday);
    const weeksAfterTrinity = Math.floor(daysBetween(trinity, date) / 7);
    return result({
      season: 'Ordinary Time after Trinity',
      colour: 'Green',
      name: isSunday
        ? `The ${ordinal(weeksAfterTrinity)} Sunday after Trinity`
        : 'Ordinary Time',
      id: proper ? `proper-${proper}` : `trinity-${weeksAfterTrinity}`,
      proper,
    });
  }

  // Fallback (should be rare): treat as Ordinary Time.
  return result({ season: 'Ordinary Time after Trinity', colour: 'Green', name: 'Ordinary Time', id: 'ordinary' });
}
