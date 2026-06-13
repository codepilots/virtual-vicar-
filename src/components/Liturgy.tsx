import type { ReactNode } from 'react';

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
  /\bmay (?:be (?:said|sung|used|read|offered|kept)|follow|replace)\b|\b(?:is|are) (?:said|sung|read|offered|kept)\b|\b(?:a |another )?suitable (?:song|hymn|chant|canticle|psalm)\b|^(?:the following|one of|one or more|\(?either\b|or,\s|this\b.*\bprayer\b|silence\b|all stand|all sit|at the end|each psalm or group)/i;
// An alternative-rubric line: a bare marker ("or" / "(or)") or one that opens
// an alternative ("or a suitable hymn,", "or A Song of God's Praise").
const ALT_MARKER = /^\(?or\b/i;
// A source/attribution line, shown muted and not read aloud — recognised by a
// trailing year in brackets, e.g. "after Lancelot Andrewes (1626)", "Ephrem
// the Syrian (373)".
const ATTRIBUTION = /\(\s*\d{3,4}\s*\)\s*$/;
// A psalm/canticle sub-heading within a section body.
const SUBHEADING = /^(psalm|canticle)\s+\d/i;
// A standalone scripture citation line, e.g. "Jeremiah 14.9", "Luke 2.29-32".
const CROSSREF = /^(?:[1-3]\s)?[A-Z][a-zA-Z]+\s+\d+[.:]\d+(?:[-–]\d+)?$/;
const REFRAIN = /^refrain:/i;
// Line ends a sentence (allowing trailing quotes and closing brackets, e.g.
// the optional "… in the breaking of the bread.]").
const TERMINAL = /[.!?][)\]}”’"']*$/;

// The congregation marker is either the "All:" sentinel the parser writes (to
// tell it apart from the word "All", e.g. "All the earth…"), or — for text
// pasted per-section, not via the whole-service parser — the raw clipboard's
// glued marker ("AllAmen.", "Allwho…"). A plain spaced "All " is the word.
const ALL_MARKER = /^All:|^All(?=[A-Za-z‘“"])/;

/** Normalise the "All" congregation marker to "All " for peeling, leaving the
 *  word "Alleluia" and ordinary "All …" prose untouched. */
function splitAllMarker(line: string): string {
  if (/^Alleluia/i.test(line)) return line;
  if (/^All:/.test(line)) return line.replace(/^All:\s*/, 'All ');
  return line.replace(/^All(?=[A-Za-z‘“"])/, 'All ');
}

function isResponseStart(rawLine: string): boolean {
  if (/^\d/.test(rawLine)) return false; // a verse, even if its text starts "All…"
  if (/^Alleluia/i.test(rawLine)) return false; // the word, not the marker
  return ALL_MARKER.test(rawLine);
}

// A line that begins a fresh logical unit (so it ends any verse/refrain that is
// gathering its soft-wrapped continuation lines, and stops a soft-wrap rejoin).
function isNewUnit(line: string): boolean {
  return (
    line === '' ||
    /^\d/.test(line) ||
    isResponseStart(line) ||
    SUBHEADING.test(line) ||
    CROSSREF.test(line) ||
    REFRAIN.test(line) ||
    RUBRIC.test(line) ||
    ALT_MARKER.test(line) ||
    ATTRIBUTION.test(line)
  );
}

// The C of E "Copy to clipboard" output breaks long sense-lines at the page's
// display width, leaving hard newlines mid-sentence. Rejoin those wraps: a line
// that doesn't close a clause (no trailing . ! ? ; : , or quote/bracket) and is
// followed by an ordinary continuation (not the start of a new logical unit) is
// a wrap, so glue the next line onto it. CW's real sense-line breaks — which
// end at clause punctuation — are kept.
function rejoinSoftWraps(lines: string[]): string[] {
  const out: string[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    const prev = out.length ? out[out.length - 1] : undefined;
    // A rubric line absorbs only a lower-case wrap fragment of itself, never a
    // following sentence (e.g. "This opening prayer may be said" must not eat
    // the prayer "The night has passed…").
    const prevIsRubric = prev !== undefined && (RUBRIC.test(prev) || ALT_MARKER.test(prev));
    if (
      prev !== undefined &&
      prev !== '' &&
      line !== '' &&
      !/[.!?;:,”’"')\]]$/.test(prev) &&
      !isNewUnit(line) &&
      !(prevIsRubric && /^[A-Z“‘"(]/.test(line))
    ) {
      out[out.length - 1] = `${prev} ${line}`;
    } else {
      out.push(line);
    }
  }
  return out;
}

// Scanning forward from line i, is there another congregation response before
// the next structural break (a rubric, alternative marker, heading, verse,
// citation or blank line)? Used to tell an officiant versicle that sits between
// responses (responsory, conclusion) from the later sentences of one long
// response (the Lord's Prayer), which has no response after it.
function responseAhead(lines: string[], i: number): boolean {
  for (let j = i + 1; j < lines.length; j++) {
    const l = lines[j].trim();
    if (l === '') return false;
    if (isResponseStart(l)) return true;
    if (
      /^\d/.test(l) ||
      SUBHEADING.test(l) ||
      CROSSREF.test(l) ||
      ATTRIBUTION.test(l) ||
      REFRAIN.test(l) ||
      RUBRIC.test(l) ||
      ALT_MARKER.test(l)
    )
      return false;
  }
  return false;
}

/**
 * Turn raw pasted text into the logical lines used for classification:
 * de-glue a mid-line "Refrain:", peel a glued "…Amen.or" alternative marker,
 * mend a missing space after ; or :, then rejoin clipboard soft-wraps. Shared
 * with the alternatives detector so it sees the same lines the renderer does.
 */
export function logicalLines(text: string): string[] {
  // The clipboard often glues a "Refrain:" onto the end of the preceding line
  // (a verse or the psalm heading, e.g. "Psalm 41 Refrain: O Lord,"), and the
  // fixed rubric that closes the psalmody ("Each psalm or group of psalms may
  // end with") onto the end of the last psalm-collect. Break both onto their
  // own line so they classify correctly (refrain / rubric), not as psalm text.
  const deglued = text
    // Drop the "(link is external)" furniture the C of E page leaves in the
    // copied text (the references themselves are surfaced in the wizard).
    .replace(/\s*\(link is external\)/gi, '')
    .replace(/([^\n])[ \t]+(?=Refrain:)/g, '$1\n')
    .replace(/([^\n])[ \t]+(?=Each psalm or group of psalms)/g, '$1\n');
  const normalised = deglued.split('\n').flatMap((raw) => {
    const l = raw.replace(/([;:])(?=[A-Za-z])/g, '$1 ');
    const m = l.trimEnd().match(/^(.*[.!?])\s*(or)$/i);
    return m ? [m[1], m[2]] : [l];
  });
  return rejoinSoftWraps(normalised);
}

// The kind of a logical line, used to find alternative ("or") choices: a marker
// separates options, framing is fixed text around them, a Gloria (or the end)
// closes a group, and content is the option text itself.
export type LiturgyLineKind = 'marker' | 'framing' | 'gloria' | 'content';
// The Gloria (Glory be) that closes a psalm/canticle — always said, never an
// alternative.
const GLORIA = /^(?:all\s+)?glory to the (?:father|god)\b/i;

export function lineKind(line: string): LiturgyLineKind {
  if (line.trim() === '') return 'framing';
  const s = splitAllMarker(line);
  if (GLORIA.test(s)) return 'gloria';
  if (ALT_MARKER.test(line)) return 'marker';
  if (isResponseStart(line)) return 'content';
  if (
    SUBHEADING.test(line) ||
    CROSSREF.test(line) ||
    ATTRIBUTION.test(line) ||
    REFRAIN.test(line) ||
    RUBRIC.test(line)
  )
    return 'framing';
  return 'content';
}

/** Logical lines tagged with their kind, for the alternatives detector. */
export function liturgyLines(text: string): { text: string; kind: LiturgyLineKind }[] {
  return logicalLines(text).map((line) => ({ text: line, kind: lineKind(line) }));
}

export function classifyLiturgy(text: string): LiturgySegment[] {
  const lines = logicalLines(text);
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
    if (CROSSREF.test(line) || ATTRIBUTION.test(line)) {
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
      let body = num ? joined.slice(num[0].length) : joined;
      // A psalm-collect often runs straight on from the last verse with no
      // delimiter — the clipboard glues a full stop to the next capital and
      // there's no verse number ("…and my God.Come, creator Spirit…"). Split it
      // off as following prose: the trailing part has no pointing (no ♦).
      let trailing = '';
      const glued = body.match(/[.!?](?=[A-Z‘“])/);
      if (glued && glued.index !== undefined) {
        const after = body.slice(glued.index + 1);
        if (!/[♦◆◇]/.test(after)) {
          trailing = after.trim();
          body = body.slice(0, glued.index + 1).trim();
        }
      }
      const parts = body
        .split(/\s*[♦◆◇]\s*/)
        .map((p) => p.trim())
        .filter(Boolean);
      response = false;
      segs.push({ role: 'verse', text: body, number, parts });
      if (trailing) segs.push({ role: 'normal', text: trailing });
      prevTerminal = true;
      continue;
    }

    if (isResponseStart(line)) {
      const rest = splitAllMarker(line).replace(/^All\s*/, '');
      segs.push({ role: 'response', text: rest, allMarker: true });
      prevTerminal = TERMINAL.test(rest);
      response = true;
      continue;
    }

    if (RUBRIC.test(line) || ALT_MARKER.test(line)) {
      response = false;
      segs.push({ role: 'rubric', text: line });
      prevTerminal = true;
      continue;
    }

    if (response) {
      // While a congregation response is open, a plain line is an officiant
      // versicle (not "All") only when its sentence has closed and another
      // response follows before the next break — the responsory/conclusion
      // pattern. Otherwise it's a later sentence of the same response (e.g. the
      // Lord's Prayer, which has no response after it).
      const officiant = prevTerminal && responseAhead(lines, i);
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
  const out: ReactNode[] = [];

  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];

    // A congregation response: gather the marker line and its continuation
    // lines into one block with the "All" label hanging in the margin.
    if (s.role === 'response') {
      const body = [s.text];
      let j = i + 1;
      while (j < segs.length && segs[j].role === 'response' && !segs[j].allMarker) {
        body.push(segs[j].text);
        j++;
      }
      out.push(
        <div className="vl-resp" key={i}>
          <span className="vl-all-margin">{s.allMarker ? 'All' : ''}</span>
          <span className="vl-resp-body">
            {body.map((b, k) => (
              <strong className="vl-resp-line" key={k}>
                {/* A pointed All response (e.g. a canticle doxology) carries ♦
                    marks; lay them out as half-verses rather than inline. */}
                {b.split(/\s*[♦◆◇]\s*/).map((part, m, arr) => (
                  <span className="vl-halfverse" key={m}>
                    {part}
                    {m < arr.length - 1 && <span className="vl-point"> ♦</span>}
                  </span>
                ))}
              </strong>
            ))}
          </span>
        </div>,
      );
      i = j - 1;
      continue;
    }

    if (s.role === 'normal' && s.text === '') out.push(<div key={i} className="vl-gap" />);
    else if (s.role === 'rubric') out.push(<div key={i} className="vl-rubric">{s.text}</div>);
    else if (s.role === 'crossref') out.push(<div key={i} className="vl-crossref">{s.text}</div>);
    else if (s.role === 'heading') out.push(<div key={i} className="vl-subheading">{s.text}</div>);
    else if (s.role === 'refrain') {
      out.push(
        <div className="vl-refrain" key={i}>
          <span className="vl-refrain-label">Refrain</span>
          <span className="vl-refrain-body">{s.text}</span>
        </div>,
      );
    } else if (s.role === 'verse') {
      const parts = s.parts ?? [s.text];
      out.push(
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
        </div>,
      );
    } else out.push(<div key={i}>{s.text}</div>);
  }

  return <div className={className}>{out}</div>;
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

/** Strip a verse number, ♦ pointing mark, refrain "R" cue and page-furniture
 *  ("(link is external)", "(page 109)") from a line for the read-aloud voice. */
function speakLine(text: string): string {
  return text
    .replace(/^\s*\d+\s*/, '')
    .replace(/\(link is external\)/gi, '')
    .replace(/\(pages?\s+[\d,\s–-]+\)/gi, '')
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

