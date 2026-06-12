// Resources for the address / sermon slot — well-regarded Anglican blogs and
// podcasts a lay leader can draw on, with RSS feeds the app can pull in so the
// latest posts/episodes appear inline. Tagged by season and congregation type
// so the suggester can filter.
//
// PROVENANCE: feed URLs follow each publisher's standard convention
// (WordPress `/feed/`, Libsyn `/rss`, Acast public feeds) but could not be
// verified from this build environment (egress-restricted), so each carries
// `feedVerified: false` until checked in a browser. The RSS client fails soft:
// if a feed doesn't load, the UI keeps the plain site link.

import type { Season } from './calendar';
import type { CongregationType } from './congregation';

export interface AddressResource {
  id: string;
  title: string;
  author: string;
  kind: 'blog' | 'podcast' | 'video' | 'sermon-archive';
  url: string;
  description: string;
  /** RSS/Atom feed for pulling recent items in-app, where known. */
  rssUrl?: string;
  /** True once the feed URL has been confirmed working in a browser. */
  feedVerified?: boolean;
  /** Seasons this best suits. Empty = any time. */
  seasons: Season[];
  /** Congregation types this best suits. Empty = all. */
  congregations: CongregationType[];
}

export const ADDRESS_RESOURCES: AddressResource[] = [
  // ---- Blogs ----
  {
    id: 'psephizo',
    title: 'Psephizo',
    author: 'Revd Dr Ian Paul',
    kind: 'blog',
    url: 'https://www.psephizo.com/',
    rssUrl: 'https://www.psephizo.com/feed/',
    feedVerified: false,
    description:
      'Weekly scholarly commentary on the Sunday lectionary gospel, plus theology and church life — one of the most-read C of E blogs and a staple for sermon preparation.',
    seasons: [],
    congregations: [],
  },
  {
    id: 'thinking-anglicans',
    title: 'Thinking Anglicans',
    author: 'Simon Sarmiento & contributors',
    kind: 'blog',
    url: 'https://www.thinkinganglicans.org.uk/',
    rssUrl: 'https://www.thinkinganglicans.org.uk/feed/',
    feedVerified: false,
    description:
      'Long-running C of E news and comment site; its weekly “Opinion” round-ups gather sermons and essays from across the church — a good source of quotable, current material.',
    seasons: [],
    congregations: [],
  },
  {
    id: 'viamedia',
    title: 'ViaMedia.News',
    author: 'Senior C of E clergy & laity',
    kind: 'blog',
    url: 'https://viamedia.news/',
    rssUrl: 'https://viamedia.news/feed/',
    feedVerified: false,
    description:
      'Essays from bishops, deans and senior lay voices in the Church of England, often engaging scripture with contemporary questions.',
    seasons: [],
    congregations: ['all-age', 'contemporary', 'cathedral'],
  },
  {
    id: 'covenant',
    title: 'Covenant (The Living Church)',
    author: 'Anglican Communion writers',
    kind: 'blog',
    url: 'https://livingchurch.org/covenant/',
    rssUrl: 'https://livingchurch.org/covenant/feed/',
    feedVerified: false,
    description:
      'Daily essays in catholic Anglican theology and spirituality from writers across the Communion — reflective material well suited to a quieter address.',
    seasons: [],
    congregations: ['traditional', 'cathedral'],
  },
  // ---- Podcasts ----
  {
    id: 'sermon-brainwave',
    title: 'Sermon Brainwave',
    author: 'Working Preacher (Luther Seminary)',
    kind: 'podcast',
    url: 'https://www.workingpreacher.org/podcasts/sermon-brainwave',
    rssUrl: 'https://sermonbrainwave.libsyn.com/rss',
    feedVerified: false,
    description:
      'Professors discuss the coming Sunday’s Revised Common Lectionary texts — released ahead of the date, so it lines up with the readings this app gives you.',
    seasons: [],
    congregations: [],
  },
  {
    id: 'godpod',
    title: 'GodPod',
    author: 'St Mellitus College (Tomlin, Williams, Lloyd)',
    kind: 'podcast',
    url: 'https://www.sptc.htb.org/godpod',
    rssUrl: 'https://feeds.acast.com/public/shows/godpod',
    feedVerified: false,
    description:
      'Warm, accessible theological conversation from St Mellitus College — good background listening when shaping a talk.',
    seasons: [],
    congregations: ['contemporary', 'family', 'all-age'],
  },
  {
    id: 'ask-nt-wright',
    title: 'Ask N.T. Wright Anything',
    author: 'Premier Unbelievable / Tom Wright',
    kind: 'podcast',
    url: 'https://www.premierunbelievable.com/shows/ask-nt-wright-anything',
    description:
      'The former Bishop of Durham answers listeners’ questions — reliable, quotable biblical theology. Subscribe in your podcast app from the site.',
    seasons: [],
    congregations: [],
  },
  {
    id: 'church-times-podcast',
    title: 'The Church Times Podcast',
    author: 'Church Times',
    kind: 'podcast',
    url: 'https://www.churchtimes.co.uk/topics/podcast',
    description:
      'Weekly interviews and discussion on Church of England life and news — useful for connecting an address to what the church is talking about this week.',
    seasons: [],
    congregations: [],
  },
  {
    id: 'pray-as-you-go',
    title: 'Pray as you go',
    author: 'Jesuit Media Initiatives',
    kind: 'podcast',
    url: 'https://pray-as-you-go.org/',
    description:
      'A daily audio reflection on the day’s scripture — a useful model for the shape and pace of a short address.',
    seasons: [],
    congregations: [],
  },
  {
    id: 'cofe-reflections',
    title: 'Church of England daily & weekly resources',
    author: 'The Church of England',
    kind: 'sermon-archive',
    url: 'https://www.churchofengland.org/prayer-and-worship/join-us-service-daily-prayer',
    description:
      'Official daily prayer audio and weekly reflections tied to the lectionary.',
    seasons: [],
    congregations: [],
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
    if (r.rssUrl) s += 0.5; // feeds we can pull in are slightly preferred
    return s;
  };
  return [...ADDRESS_RESOURCES].sort((a, b) => score(b) - score(a));
}
