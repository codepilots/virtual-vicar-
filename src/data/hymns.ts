// Hymn books, hymns, tunes and MIDI lookup.
//
// The user configures which hymn books they own (see Settings). The suggester
// then proposes hymns appropriate to the season and congregation type, and for
// each hymn finds the book number in the user's books and a MIDI file for the
// tune. A hymn may have more than one tune ("setting"); the user picks one and
// configures the number of verses/choruses and their order.

import type { Season } from './calendar';
import type { CongregationType } from './congregation';

export interface HymnBook {
  id: string;
  name: string;
  abbreviation: string;
}

export interface Tune {
  id: string;
  name: string;
  /** Metre, e.g. "87.87.87". */
  metre?: string;
  /** A URL to a MIDI rendering of the tune, where known. */
  midiUrl?: string;
}

export interface Hymn {
  id: string;
  title: string;
  firstLine: string;
  /** Number of sung verses in the canonical text. */
  verses: number;
  /** True if the hymn has a refrain/chorus. */
  hasChorus?: boolean;
  /** Seasons the hymn suits. Empty = suitable any time. */
  seasons: Season[];
  /** Congregation types the hymn suits. Empty = suits all. */
  congregations: CongregationType[];
  /** Available tunes / settings. */
  tunes: Tune[];
  /** Book id -> hymn number, for books that contain it. */
  numbers: Record<string, number>;
}

export const HYMN_BOOKS: HymnBook[] = [
  { id: 'am', name: 'Hymns Ancient & Modern', abbreviation: 'A&M' },
  { id: 'neh', name: 'The New English Hymnal', abbreviation: 'NEH' },
  { id: 'mp', name: 'Mission Praise', abbreviation: 'MP' },
  { id: 'ssp', name: 'Sing the Faith / Songs of Fellowship', abbreviation: 'SoF' },
  { id: 'cp', name: 'Common Praise', abbreviation: 'CP' },
  { id: 'hon', name: 'Hymns Old & New', abbreviation: 'HON' },
];

// SCAFFOLD: a small seed of well-known hymns. `midiUrl` points at Hymnary.org's
// file pages where a MIDI is commonly available; verify per tune in production.
export const HYMNS: Hymn[] = [
  {
    id: 'come-thou-long-expected',
    title: 'Come, thou long expected Jesus',
    firstLine: 'Come, thou long expected Jesus',
    verses: 2,
    seasons: ['Advent'],
    congregations: [],
    tunes: [
      { id: 'cross-of-jesus', name: 'Cross of Jesus', metre: '87.87', midiUrl: 'https://hymnary.org/tune/cross_of_jesus_stainer' },
      { id: 'stuttgart', name: 'Stuttgart', metre: '87.87' },
    ],
    numbers: { neh: 3, am: 32 },
  },
  {
    id: 'o-come-all-ye-faithful',
    title: 'O come, all ye faithful',
    firstLine: 'O come, all ye faithful',
    verses: 6,
    hasChorus: true,
    seasons: ['Christmas'],
    congregations: [],
    tunes: [{ id: 'adeste-fideles', name: 'Adeste Fideles', metre: 'Irregular', midiUrl: 'https://hymnary.org/tune/adeste_fideles_wade' }],
    numbers: { neh: 25, am: 78, mp: 487 },
  },
  {
    id: 'forty-days',
    title: 'Forty days and forty nights',
    firstLine: 'Forty days and forty nights',
    verses: 5,
    seasons: ['Lent'],
    congregations: [],
    tunes: [{ id: 'aus-der-tiefe', name: 'Aus der Tiefe (Heinlein)', metre: '77.77' }],
    numbers: { neh: 67, am: 119 },
  },
  {
    id: 'thine-be-the-glory',
    title: 'Thine be the glory',
    firstLine: 'Thine be the glory, risen, conquering Son',
    verses: 3,
    hasChorus: true,
    seasons: ['Easter'],
    congregations: [],
    tunes: [{ id: 'maccabaeus', name: 'Maccabaeus', metre: '10.11.11.11', midiUrl: 'https://hymnary.org/tune/maccabaeus_handel' }],
    numbers: { neh: 120, am: 205, mp: 670 },
  },
  {
    id: 'holy-holy-holy',
    title: 'Holy, holy, holy',
    firstLine: 'Holy, holy, holy! Lord God Almighty',
    verses: 4,
    seasons: ['Ordinary Time after Trinity'],
    congregations: [],
    tunes: [{ id: 'nicaea', name: 'Nicaea', metre: '11.12.12.10', midiUrl: 'https://hymnary.org/tune/nicaea_dykes' }],
    numbers: { neh: 146, am: 100, cp: 187 },
  },
  {
    id: 'shine-jesus-shine',
    title: 'Shine, Jesus, shine',
    firstLine: 'Lord, the light of your love is shining',
    verses: 3,
    hasChorus: true,
    seasons: [],
    congregations: ['contemporary', 'all-age', 'family'],
    tunes: [{ id: 'shine-jesus-shine', name: 'Shine Jesus Shine (Kendrick)' }],
    numbers: { mp: 445, ssp: 200 },
  },
  {
    id: 'great-is-thy-faithfulness',
    title: 'Great is thy faithfulness',
    firstLine: 'Great is thy faithfulness, O God my Father',
    verses: 3,
    hasChorus: true,
    seasons: [],
    congregations: [],
    tunes: [{ id: 'faithfulness', name: 'Faithfulness', metre: '11.10.11.10', midiUrl: 'https://hymnary.org/tune/faithfulness_runyan' }],
    numbers: { mp: 200, am: 630, hon: 181 },
  },
];

export function getHymn(id: string): Hymn | undefined {
  return HYMNS.find((h) => h.id === id);
}

export function getHymnBook(id: string): HymnBook | undefined {
  return HYMN_BOOKS.find((b) => b.id === id);
}

/**
 * Suggest hymns for the day. Filters to hymns the user can actually find (i.e.
 * present in at least one owned book), then scores by season and congregation
 * match. Returns best matches first.
 */
export function suggestHymns(
  season: Season,
  congregation: CongregationType | null,
  ownedBookIds: string[],
): Hymn[] {
  const owned = new Set(ownedBookIds);
  const available = HYMNS.filter((h) =>
    ownedBookIds.length === 0 ? true : Object.keys(h.numbers).some((b) => owned.has(b)),
  );
  const score = (h: Hymn): number => {
    let s = 0;
    if (h.seasons.includes(season)) s += 3;
    if (h.seasons.length === 0) s += 1; // all-season hymns are mildly suitable
    if (congregation && h.congregations.includes(congregation)) s += 2;
    if (h.congregations.length === 0) s += 1;
    return s;
  };
  return [...available].sort((a, b) => score(b) - score(a));
}
