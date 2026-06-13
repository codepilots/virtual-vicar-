import { Fragment, type ReactNode } from 'react';

// Render liturgical text with the congregation ("All") responses typeset as on
// the Church of England pages: a small "All" margin label, with the response
// itself in bold, while officiant/said text stays in regular weight.
//
// The signal is the literal "All" marker that the C of E "Copy to clipboard"
// output keeps at the start of each response (the parser tidies "AllAmen." into
// "All Amen."). Within a paragraph (blank-line separated), the response runs
// from the first "All" line to the end of that paragraph — which matches both
// one-line versicle responses and multi-line prayers (Gloria, Lord's Prayer).
//
// Text with no "All" markers (BCP texts, readings, free notes) renders exactly
// as before — plain, pre-wrapped paragraphs.

function isAllMarker(line: string): boolean {
  return line === 'All' || /^All\s/.test(line);
}

export function Liturgy({ text, className }: { text: string; className?: string }) {
  const lines = text.split('\n');
  let inResponse = false;
  const nodes: ReactNode[] = [];

  lines.forEach((line, i) => {
    if (line.trim() === '') {
      inResponse = false; // a blank line ends the current response
    } else if (isAllMarker(line)) {
      inResponse = true;
      const rest = line.replace(/^All\s*/, '');
      nodes.push(
        <Fragment key={i}>
          <span className="vl-all-margin">All</span>
          {rest && <strong className="vl-all">{rest}</strong>}
        </Fragment>,
      );
      if (i < lines.length - 1) nodes.push('\n');
      return;
    }

    nodes.push(
      inResponse ? (
        <strong key={i} className="vl-all">
          {line}
        </strong>
      ) : (
        <Fragment key={i}>{line}</Fragment>
      ),
    );
    if (i < lines.length - 1) nodes.push('\n');
  });

  return <div className={className}>{nodes}</div>;
}

/**
 * Plain text for the read-aloud voice. Always strips the "All" congregation
 * markers (a visual label, not spoken). For psalmody/readings, optionally also
 * strips verse numbers (glued to the line, e.g. "1O come") and the CW pointing
 * diamond ♦ (a breath mark, not a word) so the voice reads only the words.
 */
export function liturgyPlainText(
  text: string,
  opts?: { stripVerseNumbers?: boolean; stripPointing?: boolean },
): string {
  let t = text.replace(/^All[ \t]+/gm, '').replace(/^All$/gm, '');
  if (opts?.stripPointing) {
    // CW pointing/breath marks: ♦ (U+2666) and the metrical bullet/asterisk.
    t = t.replace(/[♦◆◇•]/g, ' ');
  }
  if (opts?.stripVerseNumbers) {
    // Leading verse number on each line ("1O come", "27 Joshua said…").
    t = t.replace(/^\s*\d+\s*/gm, '');
  }
  return t
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
