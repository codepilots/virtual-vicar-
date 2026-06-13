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
  /** A lookup that finds the resource (we don't have the original URL). */
  url: string;
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
    refs.push({
      label,
      page: pageMatch ? pageMatch[1].replace(/\s+/g, '') : undefined,
      url: lookupUrl(label),
    });
  }
  return refs;
}
