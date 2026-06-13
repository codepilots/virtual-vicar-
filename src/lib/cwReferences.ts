// The C of E "Join us in daily prayer" pages point to other Common Worship
// resources — the Acclamation of Christ at the Dawning of the Day, the Blessing
// of Light, numbered canticles, the prayer/intercession cycles. Most carry a
// Common Worship: Daily Prayer page number right in the copied text, e.g.
// "(page 109)" or "pages 362–371"; some are only a web link, marked
// "(link is external)" (the real URL is in the page's HTML, which a clipboard
// paste doesn't carry). The page number is the reliable anchor, so we key off
// it, and also surface the page-less web links. Each becomes a labelled lookup.

export interface CwReference {
  /** The referenced resource as it reads in the text. */
  label: string;
  /** Page number(s) in Common Worship: Daily Prayer, e.g. "109", "362–371". */
  page?: string;
  /** The resource's page on daily.commonworship.com when known, else a lookup. */
  url: string;
  /** True when `url` is the exact resource, false when it's a search fallback. */
  exact: boolean;
}

// A curated index of the resources the Daily Prayer pages link to, harvested
// from the source site (daily.commonworship.com). Canticles are keyed by their
// Common Worship: Daily Prayer page number (stable across dates); named
// resources by a phrase in the link text. Extend as more pages turn up.
const CW = 'https://daily.commonworship.com';
interface IndexEntry {
  page?: string;
  labelRe?: RegExp;
  path: string;
}
const CW_INDEX: IndexEntry[] = [
  { labelRe: /Acclamation of Christ at the Dawning/i, path: '/morneve/dawning.html' },
  { labelRe: /Blessing of Light/i, path: '/morneve/light.html' },
  { labelRe: /these cycles/i, path: '/day/psalmtable.html' },
  { labelRe: /(form of )?intercession found here|intercession found/i, path: '/day/intercessions.html' },
  { labelRe: /cycle on pages|362[–-]363/i, path: '/prayers/cycle.html#seasonal' },
  { labelRe: /forms? of prayer|362[–-]371/i, path: '/prayers/prayers.html' },
  // Canticles, by Daily Prayer page number.
  { page: '583', path: '/canticles/otcanticles/32.html' },
  { page: '600', path: '/canticles/otcanticles/48.html' },
  { page: '602', path: '/canticles/otcanticles/50.html' },
  { page: '606', path: '/canticles/ntcanticles/53.html' },
  { page: '613', path: '/canticles/ntcanticles/56.html' },
  { page: '620', path: '/canticles/ntcanticles/62.html' },
  { page: '627', path: '/canticles/ntcanticles/69.html' },
  { page: '632', path: '/canticles/ntcanticles/74.html' },
  { page: '634', path: '/canticles/ntcanticles/76.html' },
  { page: '636', path: '/canticles/othercanticles/79.html' },
];

/** The exact daily.commonworship.com URL for a reference, if it's in the index. */
function indexedUrl(label: string, page?: string): string | undefined {
  for (const e of CW_INDEX) {
    if (e.labelRe && e.labelRe.test(label)) return CW + e.path;
    if (e.page && page && e.page === page.replace(/-/g, '–')) return CW + e.path;
  }
  return undefined;
}

// A Common Worship: Daily Prayer page reference, parenthesised "(page 109)" or
// bare in prose "pages 362–371"; the match includes any parens, group 1 is the
// number(s).
const PAGE = /\(?pages?\s+(\d[\d\s,–-]*\d|\d)\)?/i;
const LINK_MARKER = /\(link is external\)/i;

function tidy(label: string): string {
  const clean = label.replace(/\s*\(link is external\)/gi, '').replace(/\s+/g, ' ').trim();
  const words = clean.split(' ');
  return words.length > 12 ? `…${words.slice(-12).join(' ')}` : clean;
}

function lookupUrl(label: string): string {
  const query = label.replace(/^…/, '').replace(PAGE, '').replace(/\s+/g, ' ').trim();
  return `https://www.google.com/search?q=${encodeURIComponent(`Common Worship Daily Prayer ${query}`)}`;
}

/** The Common Worship cross-references in a pasted section's text, de-duplicated
 *  and in order. Empty when the section points to nothing. Picks up both page
 *  references (the reliable anchor, with or without a web link) and page-less
 *  web links (e.g. "these cycles"). The label runs up to the reference, so it
 *  reads as the resource's name, not the words that follow it. */
export function extractCwReferences(text: string): CwReference[] {
  // Flatten the clipboard's soft-wraps so a reference keeps its context, then
  // scan clause by clause.
  const flat = text.replace(/\s*\n\s*/g, ' ');
  const refs: CwReference[] = [];
  const seen = new Set<string>();
  for (const raw of flat.split(/[.;:,]/)) {
    const clause = raw.trim();
    const pageMatch = clause.match(PAGE);
    const linkIdx = clause.search(LINK_MARKER);
    if (!pageMatch && linkIdx < 0) continue;
    // Trim the clause at the reference so the label is the resource, not what
    // comes after ("…(page 108) may replace the Preparation…").
    const cut = pageMatch ? (pageMatch.index ?? 0) + pageMatch[0].length : linkIdx;
    const label = tidy(clause.slice(0, cut));
    if (!label) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const page = pageMatch ? pageMatch[1].replace(/\s+/g, '') : undefined;
    const exact = indexedUrl(label, page);
    refs.push({ label, page, url: exact ?? lookupUrl(label), exact: Boolean(exact) });
  }
  return refs;
}
