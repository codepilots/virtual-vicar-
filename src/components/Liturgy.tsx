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

export type LiturgyRole =
  | 'heading'
  | 'rubric'
  | 'crossref'
  | 'refrain'
  | 'response'
  | 'verse'
  | 'normal';

export interface LiturgySegment {
  role: LiturgyRole;
  /** Display text (verse numbers / ♦ kept; "All" marker peeled into allMarker). */
  text: string;
  /** This line begins a congregation response (show the "All" label). */
  allMarker?: boolean;
  /** For 'verse': the verse number shown in the hanging margin. */
  number?: string;
  /** For 'verse': the ♦-separated half-verses, soft-wraps already rejoined. */
  parts?: string[];
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

// A line that begins a fresh logical unit (so it ends any verse/refrain that is
// gathering its soft-wrapped continuation lines).
function isNewUnit(line: string): boolean {
  return (
    line === '' ||
    /^\d/.test(line) ||
    isResponseStart(line) ||
    SUBHEADING.test(line) ||
    CROSSREF.test(line) ||
    REFRAIN.test(line) ||
    RUBRIC.test(line) ||
    ALT_MARKER.test(line)
  );
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
  // Normalise per line so stored/old/manually-pasted text renders correctly too
  // (not only freshly-parsed text): peel a glued "or" alternative marker off the
  // end of a response ("…Amen.or" -> "…Amen." + "or") and mend a missing space
  // after a semicolon/colon.
  const lines = text.split('\n').flatMap((raw) => {
    const l = raw.replace(/([;:])(?=[A-Za-z])/g, '$1 ');
    const m = l.trimEnd().match(/^(.*[.!?])\s*(or)$/i);
    return m ? [m[1], m[2]] : [l];
  });
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
      // Gather the refrain's soft-wrapped continuation onto one line.
      const buf = [line.replace(/^refrain:\s*/i, '')];
      while (i + 1 < lines.length && !isNewUnit(lines[i + 1].trim())) {
        buf.push(lines[++i].trim());
        if (TERMINAL.test(buf[buf.length - 1])) break;
      }
      response = false;
      segs.push({ role: 'refrain', text: buf.join(' ').replace(/\s+/g, ' ').trim() });
      prevTerminal = true;
      continue;
    }

    if (/^\d/.test(line)) {
      // A psalm/canticle verse. Gather its soft-wrapped lines, then split on the
      // ♦ pointing marks into half-verses (the real line breaks), laying it out
      // with the verse number hanging in the margin.
      const buf = [line];
      while (i + 1 < lines.length && !isNewUnit(lines[i + 1].trim())) {
        buf.push(lines[++i].trim());
      }
      const joined = buf.join(' ').replace(/\s+/g, ' ').trim();
      const num = joined.match(/^(\d+)\s*/);
      const number = num ? num[1] : '';
      const body = num ? joined.slice(num[0].length) : joined;
      const parts = body
        .split(/\s*[♦◆◇]\s*/)
        .map((p) => p.trim())
        .filter(Boolean);
      response = false;
      segs.push({ role: 'verse', text: body, number, parts });
      prevTerminal = true;
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
        if (s.role === 'verse') {
          const parts = s.parts ?? [s.text];
          return (
            <div key={i} className="vl-verse">
              <span className="vl-verse-num">{s.number}</span>
              <span className="vl-verse-body">
                {parts.map((p, k) => (
                  <span className="vl-halfverse" key={k}>
                    {renderHalfVerse(p)}
                    {k < parts.length - 1 && <span className="vl-point"> ♦</span>}
                  </span>
                ))}
              </span>
            </div>
          );
        }
        return <div key={i}>{s.text}</div>;
      })}
    </div>
  );
}

/** Display a half-verse, peeling a trailing "R" refrain cue into a marker. */
function renderHalfVerse(part: string) {
  const m = part.match(/^(.*?)\s+R$/);
  if (m) {
    return (
      <>
        {m[1]}
        <span className="vl-refrain-cue"> R</span>
      </>
    );
  }
  return part;
}

/** Strip a verse number, ♦ pointing mark and refrain "R" cue from a line. */
function speakLine(text: string): string {
  return text
    .replace(/^\s*\d+\s*/, '')
    .replace(/[♦◆◇•]/g, ' ')
    .replace(/\s+R\b/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Plain text for the read-aloud voice: only the spoken parts (officiant text,
 * congregation responses, psalm verses, refrains), with rubrics, citations,
 * headings, verse numbers and pointing marks removed.
 */
export function liturgySpeech(text: string): string {
  return classifyLiturgy(text)
    .filter(
      (s) =>
        s.role === 'normal' || s.role === 'response' || s.role === 'refrain' || s.role === 'verse',
    )
    .map((s) => speakLine(s.role === 'verse' ? (s.parts ?? [s.text]).join(' ') : s.text))
    .filter(Boolean)
    .join('\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

