// Parse a whole Common Worship Daily Prayer service (as pasted from the Church
// of England "Join us in daily prayer" pages) into per-section text, keyed by
// our service section ids.
//
// The C of E pages have stable heading lines ("Preparation", "Psalmody",
// "Canticle", "Scripture Reading", "Gospel Canticle", "Prayers", "The Collect
// …", "The Lord's Prayer …", "The Conclusion"). We split the text on those
// headings and assign each block to the matching section. Works on both the
// page's "Copy to clipboard" output and a manual selection.

import type { ServiceDefinition } from '../data/services';

interface Anchor {
  test: RegExp;
  /** Candidate section ids, in priority order; first one present in the
   *  service (and not already filled) wins. */
  ids: string[];
}

// Order matters only for readability; matching is per-line.
const ANCHORS: Anchor[] = [
  { test: /^preparation\b/i, ids: ['preparation'] },
  { test: /^psalmody\b/i, ids: ['psalmody'] },
  { test: /^canticle\b/i, ids: ['canticle'] },
  { test: /scripture\s+reading/i, ids: ['first-reading', 'reading'] },
  { test: /^(the\s+)?reading\b/i, ids: ['first-reading', 'reading'] },
  { test: /gospel\s+canticle/i, ids: ['gospel-canticle', 'nunc-dimittis'] },
  { test: /^responsory\b/i, ids: ['responsory'] },
  { test: /^(the\s+)?prayers\b/i, ids: ['prayers'] },
  { test: /^intercessions\b/i, ids: ['prayers'] },
  { test: /^the\s+collect\b/i, ids: ['collect'] },
  { test: /lord.?s\s+prayer/i, ids: ['lords-prayer'] },
  { test: /^the\s+conclusion\b/i, ids: ['conclusion'] },
];

// A heading-only divider on the page that ends the previous block but starts
// no captured one.
const DIVIDER = /^the\s+word\s+of\s+god\b/i;

// Lines from here on are page footer / chrome — stop capturing the service.
const FOOTER =
  /^(©|the\s+archbishops.{0,4}council|official\s+common\s+worship|the\s+bible\s+readings|implemented\s+by|implementation\s+copyright|view\s+other\s+services|copy\s+to\s+clipboard|share\s+this\s+page|was\s+this\s+page\s+helpful|prayer\s+for\s+the\s+day|sign\s+up\s+for\s+our\s+newsletter)/i;

function isHeadingLine(line: string): Anchor | 'divider' | null {
  // Headings are short standalone lines.
  if (line.length === 0 || line.length > 48) return null;
  if (DIVIDER.test(line)) return 'divider';
  for (const a of ANCHORS) {
    if (a.test.test(line)) return a;
  }
  return null;
}

/** Tidy a captured block: trim blank edges, collapse blank runs, and split the
 *  "All" congregation marker off the word it's glued to (e.g. "AllAmen."). */
function clean(lines: string[]): string {
  const out = lines
    .map((l) => l.replace(/^All(?=[A-Z‘“"])/, 'All '))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return out;
}

export interface CwParseResult {
  /** Section id -> parsed text. */
  texts: Record<string, string>;
  /** Section ids that received text. */
  filledIds: string[];
  /** Heading labels found in the paste that mapped to no section. */
  unmatchedHeadings: string[];
}

/**
 * Parse pasted Daily Prayer text into per-section text for the given service.
 * Returns an empty result if no recognisable headings are found.
 */
export function parseCommonWorshipService(
  raw: string,
  service: ServiceDefinition,
): CwParseResult {
  const sectionIds = new Set(service.sections.map((s) => s.id));
  const lines = raw
    .replace(/\r\n?/g, '\n')
    .replace(/<!--|-->/g, '') // drop any HTML-comment leakage from odd pastes
    .split('\n')
    .map((l) => l.trim());

  // Collect every candidate block per section; the page can repeat a heading
  // (e.g. "The Collect of the day or the following is said" then "The Collect
  // of the day is said"), so we keep the longest, real block for each section.
  const candidates: Record<string, string[]> = {};
  const unmatchedHeadings: string[] = [];

  let currentIds: string[] | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (currentIds && buffer.length) {
      const body = clean(buffer);
      if (body) {
        for (const id of currentIds) {
          if (sectionIds.has(id)) {
            (candidates[id] ??= []).push(body);
            break;
          }
        }
      }
    }
    buffer = [];
  };

  for (const line of lines) {
    if (FOOTER.test(line)) break;
    const heading = isHeadingLine(line);
    if (heading === 'divider') {
      flush();
      currentIds = null;
      continue;
    }
    if (heading) {
      flush();
      // Record headings we recognise but can't place in this service.
      if (!heading.ids.some((id) => sectionIds.has(id))) unmatchedHeadings.push(line);
      currentIds = heading.ids;
      continue;
    }
    if (currentIds) buffer.push(line);
  }
  flush();

  const texts: Record<string, string> = {};
  const filledIds: string[] = [];
  for (const [id, blocks] of Object.entries(candidates)) {
    const best = blocks.reduce((a, b) => (b.length > a.length ? b : a));
    texts[id] = best;
    filledIds.push(id);
  }

  return { texts, filledIds, unmatchedHeadings };
}
