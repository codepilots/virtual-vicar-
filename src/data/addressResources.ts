// Resources for the address / sermon slot — blogs and podcasts from notable
// Anglican voices that a lay leader can draw on. Tagged by season and
// congregation type so the suggester can filter.
//
// SCAFFOLD: a starter list of well-known, public resources. Extend freely.

import type { Season } from './calendar';
import type { CongregationType } from './congregation';

export interface AddressResource {
  id: string;
  title: string;
  author: string;
  kind: 'blog' | 'podcast' | 'video' | 'sermon-archive';
  url: string;
  description: string;
  /** Seasons this best suits. Empty = any time. */
  seasons: Season[];
  /** Congregation types this best suits. Empty = all. */
  congregations: CongregationType[];
}

export const ADDRESS_RESOURCES: AddressResource[] = [
  {
    id: 'cofe-weekly-reflections',
    title: 'Church of England Weekly Reflections',
    author: 'The Church of England',
    kind: 'blog',
    url: 'https://www.churchofengland.org/prayer-and-worship/join-us-service-daily-prayer',
    description: 'Short, lectionary-linked reflections published each week.',
    seasons: [],
    congregations: [],
  },
  {
    id: 'pray-as-you-go',
    title: 'Pray as you go',
    author: 'Jesuit Media Initiatives',
    kind: 'podcast',
    url: 'https://pray-as-you-go.org/',
    description: 'A daily audio reflection on the day’s scripture — useful as a model for an address.',
    seasons: [],
    congregations: [],
  },
  {
    id: 'lectionary-podcast',
    title: 'The Lectionary Lab / Working Preacher',
    author: 'Various',
    kind: 'podcast',
    url: 'https://www.workingpreacher.org/',
    description: 'Commentary on the Revised Common Lectionary readings for the coming Sunday.',
    seasons: [],
    congregations: [],
  },
  {
    id: 'godpod',
    title: 'The God Pod',
    author: 'St Mellitus College',
    kind: 'podcast',
    url: 'https://www.premier.plus/',
    description: 'Accessible theological conversation; good background for preparing a talk.',
    seasons: [],
    congregations: ['contemporary', 'family', 'all-age'],
  },
];

export function suggestAddressResources(
  season: Season,
  congregation: CongregationType | null,
): AddressResource[] {
  const score = (r: AddressResource): number => {
    let s = 0;
    if (r.seasons.includes(season)) s += 2;
    if (r.seasons.length === 0) s += 1;
    if (congregation && r.congregations.includes(congregation)) s += 2;
    if (r.congregations.length === 0) s += 1;
    return s;
  };
  return [...ADDRESS_RESOURCES].sort((a, b) => score(b) - score(a));
}
