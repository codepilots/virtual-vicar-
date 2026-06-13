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
  /** Candidate section ids, in priority order; the first one present in the
   *  service and not already filled wins. */
  ids: string[];
  /** Keep the matched line in the captured block (for rubric-introduced
   *  sections whose heading is itself part of the guidance). */
  keepLine?: boolean;
}

// Short standalone heading lines. Order matters only for readability; matching
// is per-line. `ids` are tried in order against the sections this service
// actually has, so the same anchor serves several offices (e.g. "Short
// readings" in Prayer During the Day vs "Scripture Reading" in Morning/Evening
// both feed a reading slot).
const ANCHORS: Anchor[] = [
  // Single-word section titles: end-anchored so they match the standalone
  // heading line and never a body line that merely starts with the word (e.g.
  // "canticle, extempore praise or" within the Praise block).
  { test: /^preparation$/i, ids: ['preparation'] },
  { test: /^praise$/i, ids: ['praise'] },
  { test: /^psalmody$/i, ids: ['psalmody'] },
  { test: /^canticle$/i, ids: ['canticle'] },
  // "Scripture Reading" is the reading after the canticle; if the first reading
  // was already taken in the psalmody (see the rubric anchor below), it falls
  // through to the second-reading slot.
  { test: /scripture\s+reading/i, ids: ['first-reading', 'second-reading', 'reading'] },
  { test: /^short\s+readings?$/i, ids: ['reading', 'first-reading'] },
  { test: /^(the\s+)?reading\b/i, ids: ['first-reading', 'reading'] },
  { test: /gospel\s+canticle/i, ids: ['gospel-canticle', 'nunc-dimittis'] },
  { test: /^responsory$/i, ids: ['responsory', 'response'] },
  { test: /^response$/i, ids: ['response', 'responsory'] },
  { test: /^(the\s+)?prayers\b/i, ids: ['prayers'] },
  { test: /^intercessions\b/i, ids: ['prayers'] },
  // Prayer During the Day introduces the collect as "Or, the Collect …".
  { test: /^(or,?\s+)?the\s+collect\b/i, ids: ['collect'] },
  { test: /lord.?s\s+prayer/i, ids: ['lords-prayer'] },
  { test: /^the\s+conclusion\b/i, ids: ['conclusion'] },
];

// Section starts that the page introduces only by a rubric (no short title of
// their own), so they may run past the short-heading length limit. `keepLine`
// keeps the rubric in the section — it's part of the guidance, not just a
// heading.
const RUBRIC_ANCHORS: Anchor[] = [
  // The post-reading responsory in Morning/Evening Prayer: "A suitable song or
  // chant, or a responsory in this or another form, may follow".
  { test: /\bsuitable\s+(song|hymn|chant)\b.*\bresponsory\b/i, ids: ['responsory'], keepLine: true },
  // The first of two readings may be read in the psalmody position: "If there
  // are two Scripture readings, the first may be read here, or both may be read
  // after the canticle." Splits that first reading out of the psalmody.
  { test: /if there are two scripture readings/i, ids: ['first-reading'], keepLine: true },
];

// A heading-only divider on the page that ends the previous block but starts
// no captured one.
const DIVIDER = /^the\s+word\s+of\s+god\b/i;

// Lines from here on are page footer / chrome — stop capturing the service.
const FOOTER =
  /^(©|the\s+archbishops.{0,4}council|official\s+common\s+worship|the\s+bible\s+readings|implemented\s+by|implementation\s+copyright|view\s+other\s+services|copy\s+to\s+clipboard|share\s+this\s+page|was\s+this\s+page\s+helpful|prayer\s+for\s+the\s+day|sign\s+up\s+for\s+our\s+newsletter)/i;

function isHeadingLine(line: string): Anchor | 'divider' | null {
  if (line.length === 0) return null;
  if (DIVIDER.test(line)) return 'divider';
  // Rubric-introduced section starts may be long, so test them before the
  // short-heading length limit.
  for (const a of RUBRIC_ANCHORS) {
    if (a.test.test(line)) return a;
  }
  // Other headings are short standalone lines.
  if (line.length > 48) return null;
  for (const a of ANCHORS) {
    if (a.test.test(line)) return a;
  }
  return null;
}

/** Tidy a captured block: rejoin a standalone "All" congregation marker with
 *  the response on the following line (the Prayer During the Day clipboard
 *  format), split the glued "All" marker off its response (the Morning/Evening
 *  format), separate a glued ".or" rubric, mend missing spaces after a
 *  semicolon/colon, and collapse blank runs.
 *
 *  The congregation marker is written as "All:" (with a colon) so it can be
 *  told apart from the ordinary word "All" (e.g. "All the earth…"), which the
 *  clipboard leaves spaced. The renderer drops the colon. */
function clean(lines: string[]): string {
  // Merge a lone "All" marker into the next non-empty line, so the response is
  // recognised and bolded ("All" / "O Lord, make haste…" -> "All: O Lord, …").
  const joined: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^All$/.test(lines[i].trim())) {
      let j = i + 1;
      while (j < lines.length && !lines[j].trim()) j++;
      if (j < lines.length) {
        joined.push(`All: ${lines[j].trim()}`);
        i = j;
        continue;
      }
    }
    joined.push(lines[i]);
  }
  return joined
    .map((l) => {
      let s = l;
      // Glued marker "AllAmen.", "Allwho…" -> "All: …" (colon distinguishes the
      // marker from the word "All"); leave "Alleluia" intact.
      if (!/^Alleluia/i.test(s)) s = s.replace(/^All(?=[A-Za-z‘“"])/, 'All: ');
      // A glued "or" alternative-rubric after a response, e.g. "Amen.or".
      s = s.replace(/([.!?])or$/i, '$1\nor');
      // Missing space after ; or : that the CW source/clipboard drops.
      s = s.replace(/([;:])(?=[A-Za-z])/g, '$1 ');
      return s;
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
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

  const texts: Record<string, string> = {};
  const unmatchedHeadings: string[] = [];

  let currentIds: string[] | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (currentIds && buffer.length) {
      const body = clean(buffer);
      if (body) {
        const ids = currentIds.filter((id) => sectionIds.has(id));
        // Fill the first matching slot that's still empty (so the two readings
        // land in two slots); if all are filled, keep the longer block — the
        // page sometimes repeats a heading.
        const target = ids.find((id) => texts[id] === undefined) ?? ids[0];
        if (target !== undefined && body.length > (texts[target]?.length ?? 0)) {
          texts[target] = body;
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
      // Rubric-introduced sections keep their heading line as guidance.
      if (heading.keepLine) buffer.push(line);
      continue;
    }
    if (currentIds) buffer.push(line);
  }
  flush();

  return { texts, filledIds: Object.keys(texts), unmatchedHeadings };
}
