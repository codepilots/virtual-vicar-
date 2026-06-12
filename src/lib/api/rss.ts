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
}

function text(el: Element | null | undefined): string {
  return (el?.textContent ?? '').trim();
}

/** Strip tags and collapse whitespace for a short summary. */
function plainSummary(html: string, max = 200): string {
  const stripped = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#\d+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return stripped.length > max ? `${stripped.slice(0, max - 1)}…` : stripped;
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
      items.push({
        title,
        link,
        date: parsed && !Number.isNaN(parsed.getTime()) ? parsed.toISOString() : undefined,
        summary: summaryRaw ? plainSummary(summaryRaw) : undefined,
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
