// Detect and resolve the "or" alternatives in a pasted Common Worship section.
//
// CW offices frequently offer a choice: two forms of an opening prayer, the
// contemporary or traditional Lord's Prayer, a hymn or a canticle, and so on.
// The choices are marked in the text by "(or)" / "or …" lines. They are often
// *embedded* in a larger section: the opening versicle comes before the choice
// and the Gloria/opening prayer after it, and those must stay put whichever
// option is picked.
//
// We split a section into fixed framing and alternative *groups*: a marker
// starts a new option; framing rubrics that fall inside an open group introduce
// the next option (e.g. "Let us pray with confidence…" before the traditional
// Lord's Prayer); a Gloria or the end of the section closes the group. The
// wizard shows a chooser per group; run mode / print then render only the
// chosen option (or all of them, "decide on the day", which is the default).

import { liturgyLines } from '../components/Liturgy';

export interface AltOption {
  /** A short label for the wizard chooser (the option's first spoken line). */
  label: string;
  /** The lines that make up this option. */
  lines: string[];
}

export interface AltGroup {
  options: AltOption[];
  /** The group's original lines, used verbatim for the "show all" choice. */
  rawLines: string[];
}

interface Item {
  kind: 'fixed' | 'group';
  lines?: string[];
  group?: AltGroup;
}

function stripAll(s: string): string {
  // Drop the "All:" sentinel or a glued "All" marker; leave ordinary prose.
  return s
    .replace(/^All:\s*/, '')
    .replace(/^All(?=[A-Z‘“"])/, '')
    .trim();
}

// An introduction to a said prayer ("As our Saviour taught us, so we pray",
// "Let us pray with confidence…") — skipped when labelling so the label is the
// prayer's own opening words (or its response, when the prayer is a response).
const INTRO = /^(?:let us\b|as (?:our|we)\b)|(?:so we pray|taught us)$/i;

function label(line: string | undefined): string {
  const s = stripAll(line ?? '').trim();
  if (!s) return '—';
  return s.length > 46 ? `${s.slice(0, 45).trimEnd()}…` : s;
}

/** The clearest line to label an option by: the first line that isn't an
 *  alternative marker or a prayer introduction. */
function optionLabel(lines: string[]): string {
  const pick = lines.find((l) => {
    const t = l.trim();
    return t !== '' && !INTRO.test(t) && !/^\(?(?:either|or)\b/i.test(t);
  });
  return label(pick ?? lines[0]);
}

/** Strip the leading "or" / "(or)" marker, leaving any inline option text
 *  (e.g. "or a suitable hymn," -> "a suitable hymn,"). */
function markerResidual(line: string): string {
  return line.replace(/^\(?or\)?,?\s*/i, '').trim();
}

function parseItems(text: string): Item[] {
  const lines = liturgyLines(text);
  const items: Item[] = [];
  let fixed: string[] = []; // content lines since the last framing line
  let options: { lines: string[] }[] | null = null;
  let rawLines: string[] = [];

  const flushFixed = () => {
    if (fixed.length) {
      items.push({ kind: 'fixed', lines: fixed });
      fixed = [];
    }
  };
  const closeGroup = () => {
    if (options) {
      items.push({
        kind: 'group',
        group: {
          options: options.map((o) => ({ label: optionLabel(o.lines), lines: o.lines })),
          rawLines,
        },
      });
      options = null;
      rawLines = [];
    }
  };

  for (const { text: lt, kind } of lines) {
    if (options) {
      // A group is open.
      if (kind === 'gloria') {
        closeGroup();
        items.push({ kind: 'fixed', lines: [lt] });
        continue;
      }
      rawLines.push(lt);
      if (kind === 'marker') {
        const seed = markerResidual(lt);
        options.push({ lines: seed ? [seed] : [] });
        continue;
      }
      options[options.length - 1].lines.push(lt);
      continue;
    }

    // No group open yet.
    if (kind === 'marker') {
      // The content gathered since the last framing line is the first option.
      const opt0 = fixed;
      fixed = [];
      rawLines = [...opt0, lt];
      const seed = markerResidual(lt);
      options = [{ lines: opt0 }, { lines: seed ? [seed] : [] }];
    } else if (kind === 'content') {
      fixed.push(lt);
    } else {
      // framing or gloria: a boundary that the first option can't reach across.
      flushFixed();
      items.push({ kind: 'fixed', lines: [lt] });
    }
  }
  closeGroup();
  flushFixed();
  return items;
}

/** The alternative groups in a section's text, in order (empty if none). */
export function detectAlternativeGroups(text: string): AltGroup[] {
  return parseItems(text)
    .filter((i) => i.kind === 'group')
    .map((i) => i.group!);
}

/**
 * Reduce a section's text to the chosen options. `choices[i]` is the option
 * index for group i, or < 0 (or missing) to keep all of that group's text.
 * Returns the text unchanged when nothing is narrowed.
 */
export function applyAlternativeChoices(text: string, choices?: number[]): string {
  if (!choices || choices.every((c) => c < 0)) return text;
  const items = parseItems(text);
  const out: string[] = [];
  let gi = 0;
  for (const it of items) {
    if (it.kind === 'fixed') {
      out.push(...(it.lines ?? []));
    } else {
      const g = it.group!;
      const choice = choices[gi] ?? -1;
      gi += 1;
      if (choice < 0 || choice >= g.options.length) out.push(...g.rawLines);
      else out.push(...g.options[choice].lines);
    }
  }
  return out.join('\n');
}
