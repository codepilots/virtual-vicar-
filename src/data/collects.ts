// Collects keyed by the liturgical-day `id` produced by the calendar engine.
//
// SCAFFOLD: this ships with a handful of illustrative entries plus a reliable
// link-out to the official Church of England Collects so every day resolves to
// the correct text. Populate `COLLECTS` over time; anything missing falls back
// to `officialCollectUrl(day)`.

import type { LiturgicalDay } from './calendar';

export interface Collect {
  /** The Collect of the day. */
  collect: string;
  /** The Post Communion / additional collect, where relevant (optional). */
  postCommunion?: string;
  /** Source attribution shown in the UI. */
  source?: string;
}

// A small seed set. Texts here are short, illustrative placeholders so the UI
// renders; replace with the authorised Common Worship collects as needed.
export const COLLECTS: Record<string, Collect> = {
  'trinity-sunday': {
    collect:
      '[Collect for Trinity Sunday — see the official Common Worship text via the link below.]',
    source: 'Common Worship',
  },
  'easter-day': {
    collect:
      '[Collect for Easter Day — see the official Common Worship text via the link below.]',
    source: 'Common Worship',
  },
  'christmas-day': {
    collect:
      '[Collect for Christmas Day — see the official Common Worship text via the link below.]',
    source: 'Common Worship',
  },
};

/** Deep-link to the official Church of England Collects & Post Communions. */
export function officialCollectUrl(_day: LiturgicalDay): string {
  // The C of E publishes the full set of Collects and Post Communions here.
  return 'https://www.churchofengland.org/prayer-and-worship/worship-texts-and-resources/common-worship/churchs-year/collects-and-post-communions';
}

export function getCollect(day: LiturgicalDay): Collect | undefined {
  return COLLECTS[day.id];
}
