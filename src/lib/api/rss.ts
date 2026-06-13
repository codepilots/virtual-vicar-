// RSS / Atom feed client for the address-resource blogs and podcasts.
//
// Most blogs don't send CORS headers, so a direct browser fetch often fails.
// Strategy: try the feed directly first (podcast hosts frequently do allow
// it), then fall back through a chain of public CORS passthroughs (see
// cors.ts). Every path is cached and every failure returns [] — the UI keeps
// the plain site link, so a broken feed never blocks the user.

import { fetchTextViaCors } from './cors';

export interface FeedItem {
  title: string;
  link: string;
  /** ISO date string when the feed provides one. */
  date?: string;
  /** Short plain-text summary. */
  summary?: string;
  /** Fuller plain-text body (content:encoded / Atom content), for the notes. */
  content?: string;
  /** A media enclosure (podcast episode audio), for one-click playback. */
  audioUrl?: string;
}

function text(el: Element | null | undefined): string {
  return (el?.textContent ?? '').trim();
}

/** Decode the handful of HTML entities that survive in feed text. */
function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&[a-z]+;/gi, ' ');
}

/** Strip tags and collapse whitespace for a short summary. */
function plainSummary(html: string, max = 200): string {
  const stripped = decodeEntities(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
  return stripped.length > max ? `${stripped.slice(0, max - 1)}…` : stripped;
}

/** Strip tags but keep paragraph breaks — for dropping the body into notes. */
function plainText(html: string): string {
  return decodeEntities(
    html
      .replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ''),
  )
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/ *\n */g, '\n')
    .trim();
}

/** The audio enclosure URL on a feed item, if any (RSS <enclosure> or an Atom
 *  <link rel="enclosure">). */
function audioEnclosure(el: Element): string | undefined {
  for (const enc of Array.from(el.getElementsByTagName('enclosure'))) {
    const type = enc.getAttribute('type') ?? '';
    const url = enc.getAttribute('url');
    if (url && (type.startsWith('audio') || /\.mp3(\?|$)/i.test(url))) return url;
  }
  for (const link of Array.from(el.querySelectorAll('link[rel="enclosure"]'))) {
    const type = link.getAttribute('type') ?? '';
    const href = link.getAttribute('href');
    if (href && (type.startsWith('audio') || /\.mp3(\?|$)/i.test(href))) return href;
  }
  return undefined;
}

/** Parse an RSS 2.0 or Atom document into items. Returns [] on anything odd. */
export function parseFeed(xml: string, limit = 5): FeedItem[] {
  try {
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    if (doc.querySelector('parsererror')) return [];

    // RSS 2.0: <channel><item>; Atom: <feed><entry>.
    const rssItems = Array.from(doc.querySelectorAll('channel > item'));
    const atomEntries = rssItems.length ? [] : Array.from(doc.querySelectorAll('feed > entry'));

    const items: FeedItem[] = [];
    for (const el of [...rssItems, ...atomEntries]) {
      const title = text(el.querySelector('title'));
      // RSS uses <link>text</link>; Atom uses <link href="..."/>.
      const linkEl = el.querySelector('link');
      const link = text(linkEl) || linkEl?.getAttribute('href') || '';
      if (!title || !link) continue;
      const dateRaw =
        text(el.querySelector('pubDate')) ||
        text(el.querySelector('published')) ||
        text(el.querySelector('updated'));
      const parsed = dateRaw ? new Date(dateRaw) : null;
      const summaryRaw =
        text(el.querySelector('description')) || text(el.querySelector('summary'));
      // Full body: content:encoded (RSS) or <content> (Atom), else the summary.
      const contentRaw =
        text(el.getElementsByTagName('content:encoded')[0]) ||
        text(el.querySelector('content')) ||
        summaryRaw;
      items.push({
        title,
        link,
        date: parsed && !Number.isNaN(parsed.getTime()) ? parsed.toISOString() : undefined,
        summary: summaryRaw ? plainSummary(summaryRaw) : undefined,
        content: contentRaw ? plainText(contentRaw) : undefined,
        audioUrl: audioEnclosure(el),
      });
      if (items.length >= limit) break;
    }
    return items;
  } catch {
    return [];
  }
}

/** Fetch and parse a feed: direct first, then via the passthrough chain. */
export async function fetchFeed(feedUrl: string, limit = 5): Promise<FeedItem[]> {
  // Validate per attempt so a proxy's own error page (often HTTP 200) is
  // rejected and the next route is tried.
  const body = await fetchTextViaCors(feedUrl, (b) => parseFeed(b, 1).length > 0);
  return body ? parseFeed(body, limit) : [];
}
