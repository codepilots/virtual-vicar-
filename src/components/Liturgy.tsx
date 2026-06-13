// Typeset Common Worship text pasted from the C of E "Copy to clipboard" output
// the way the original page does, and tell the read-aloud voice what to skip.
//
// The clipboard is plain text with the structure flattened, but the line
// content still carries reliable signals (matching the page's vlrubric /
// vlcrossreference / vlall / vlpsalm classes):
//   • rubrics / directions  — "… may be said/sung/used", "The following …" …
//   • scripture citations    — "Jeremiah 14.9", "Luke 2.29-32"
//   • refrains               — "Refrain: …"
//   • congregation responses — lines beginning with the "All" marker
//   • psalm verses           — leading verse number + the ♦ pointing mark
//
// Rubrics, citations and refrain labels are shown muted/italic and are NOT
// read aloud; responses are bold with an "All" margin label; verse numbers and
// ♦ are kept on screen but dropped from the spoken text.

export type LiturgyRole = 'heading' | 'rubric' | 'crossref' | 'refrain' | 'response' | 'normal';

export interface LiturgySegment {
  role: LiturgyRole;
  /** Display text (verse numbers / ♦ kept; "All" marker peeled into allMarker). */
  text: string;
  /** This line begins a congregation response (show the "All" label). */
  allMarker?: boolean;
}

// A line is a direction/rubric (not spoken, shown muted-italic).
const RUBRIC =
  /\bmay (?:be (?:said|sung|used|read|offered|kept)|follow)\b|\bis (?:said|sung|read)\b|^the following\b|^one of the\b|^at the end\b|^silence\b|another suitable/i;
// A bare alternative marker between options, e.g. "or" / "(or)".
const ALT_MARKER = /^\(?or\)?$/i;
// A psalm/canticle sub-heading within a section body.
const SUBHEADING = /^(psalm|canticle)\s+\d/i;
// A standalone scripture citation line, e.g. "Jeremiah 14.9", "Luke 2.29-32".
const CROSSREF = /^(?:[1-3]\s)?[A-Z][a-zA-Z]+\s+\d+[.:]\d+(?:[-–]\d+)?$/;
const REFRAIN = /^refrain:/i;
// Line ends a sentence (allowing a trailing quote/bracket).
const TERMINAL = /[.!?][)”’"']*$/;

/** Separate a glued "All" congregation marker from its response ("AllAmen." ->
 *  "All Amen.", "Allwho" -> "All who"), without breaking the word "Alleluia". */
function splitAllMarker(line: string): string {
  if (/^Alleluia/i.test(line)) return line;
  return line.replace(/^All(?=[A-Za-z‘“"])/, 'All ');
}

function isResponseStart(rawLine: string): boolean {
  if (/^\d/.test(rawLine)) return false; // a verse, even if its text starts "All…"
  const s = splitAllMarker(rawLine);
  return /^All(?:\s|$)/.test(s);
}

// Looking forward from line i, does the next *logical unit* (skipping wrapped
// continuation lines) begin a congregation response? Used to spot an officiant
// versicle sitting between two responses.
function nextUnitIsResponse(lines: string[], i: number): boolean {
  for (let j = i + 1; j < lines.length; j++) {
    const l = lines[j].trim();
    if (l === '') return false;
    const prev = lines[j - 1].trim();
    if (j > i + 1 && !TERMINAL.test(prev)) continue; // wrapped continuation — skip
    return isResponseStart(l);
  }
  return false;
}

export function classifyLiturgy(text: string): LiturgySegment[] {
  const lines = text.split('\n');
  const segs: LiturgySegment[] = [];
  let response = false;
  let prevTerminal = true;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '') {
      response = false;
      prevTerminal = true;
      segs.push({ role: 'normal', text: '' });
      continue;
    }

    if (SUBHEADING.test(line)) {
      response = false;
      segs.push({ role: 'heading', text: line });
      prevTerminal = true;
      continue;
    }
    if (CROSSREF.test(line)) {
      response = false;
      segs.push({ role: 'crossref', text: line });
      prevTerminal = true;
      continue;
    }
    if (REFRAIN.test(line)) {
      response = false;
      segs.push({ role: 'refrain', text: line.replace(/^refrain:\s*/i, '') });
      prevTerminal = true;
      continue;
    }

    if (/^\d/.test(line)) {
      // A psalm/canticle verse — keep the number for display; speech strips it.
      response = false;
      segs.push({ role: 'normal', text: line });
      prevTerminal = TERMINAL.test(line);
      continue;
    }

    if (isResponseStart(line)) {
      response = true;
      const rest = splitAllMarker(line).replace(/^All\s*/, '');
      segs.push({ role: 'response', text: rest, allMarker: true });
      prevTerminal = TERMINAL.test(rest);
      continue;
    }

    if (RUBRIC.test(line) || ALT_MARKER.test(line)) {
      response = false;
      segs.push({ role: 'rubric', text: line });
      prevTerminal = true;
      continue;
    }

    if (response) {
      // An officiant versicle between responses: it follows a completed unit
      // and is itself immediately followed by a response (or a response begins
      // the next unit). Otherwise this line is a response continuation.
      const nextLine = (lines[i + 1] ?? '').trim();
      const officiant =
        prevTerminal &&
        ((nextLine !== '' && isResponseStart(nextLine)) ||
          (TERMINAL.test(line) && nextUnitIsResponse(lines, i)));
      if (officiant) {
        response = false;
        segs.push({ role: 'normal', text: line });
      } else {
        segs.push({ role: 'response', text: line });
      }
    } else {
      segs.push({ role: 'normal', text: line });
    }
    prevTerminal = TERMINAL.test(line);
  }

  return segs;
}

export function Liturgy({ text, className }: { text: string; className?: string }) {
  const segs = classifyLiturgy(text);
  return (
    <div className={className}>
      {segs.map((s, i) => {
        if (s.role === 'normal' && s.text === '') return <div key={i} className="vl-gap" />;
        if (s.role === 'rubric') return <div key={i} className="vl-rubric">{s.text}</div>;
        if (s.role === 'crossref') return <div key={i} className="vl-crossref">{s.text}</div>;
        if (s.role === 'heading') return <div key={i} className="vl-subheading">{s.text}</div>;
        if (s.role === 'refrain') {
          return (
            <div key={i}>
              <span className="vl-refrain-label">Refrain</span>
              {s.text ? <span> {s.text}</span> : null}
            </div>
          );
        }
        if (s.role === 'response') {
          return (
            <div key={i}>
              {s.allMarker && <span className="vl-all-margin">All</span>}
              {s.text && <strong className="vl-all">{s.text}</strong>}
            </div>
          );
        }
        return <div key={i}>{s.text}</div>;
      })}
    </div>
  );
}

/** Strip a verse number, ♦ pointing mark and refrain "R" cue from a line. */
function speakLine(text: string): string {
  return text
    .replace(/^\s*\d+\s*/, '')
    .replace(/[♦◆◇•]/g, ' ')
    .replace(/\s+R$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Plain text for the read-aloud voice: only the spoken parts (officiant text,
 * congregation responses, refrains), with rubrics, citations, headings, verse
 * numbers and pointing marks removed.
 */
export function liturgySpeech(text: string): string {
  return classifyLiturgy(text)
    .filter((s) => s.role === 'normal' || s.role === 'response' || s.role === 'refrain')
    .map((s) => speakLine(s.text))
    .filter(Boolean)
    .join('\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

