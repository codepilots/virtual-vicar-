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

/** Strip the "All" congregation markers so TTS reads only the spoken words. */
export function liturgyPlainText(text: string): string {
  return text.replace(/^All[ \t]+/gm, '').replace(/^All$/gm, '').trim();
}
