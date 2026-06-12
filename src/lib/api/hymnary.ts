// Hymnary.org scripture API client — hymns associated with a scripture
// passage (https://hymnary.org/api/scripture?reference=…). Used to offer
// hymn suggestions that genuinely follow the day's readings, alongside the
// local season-based suggester.
//
// The endpoint may be CORS-restricted in some browsers; every failure path
// returns [] and the UI simply shows the local suggestions only.

import { cachedJson } from './http';
import type { ScriptureRef } from '../../data/readings';

export interface HymnaryHit {
  title: string;
  url: string;
  /** How many hymnals carry it — a rough popularity signal. */
  hymnalCount: number;
}

function asString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function asCount(v: unknown): number {
  const n = typeof v === 'number' ? v : parseInt(asString(v), 10);
  return Number.isFinite(n) ? n : 0;
}

export async function fetchHymnsForReading(
  ref: ScriptureRef,
  limit = 6,
): Promise<HymnaryHit[]> {
  const reference = encodeURIComponent(`${ref.book} ${ref.passage.replace(/\./g, ':')}`);
  const payload = await cachedJson<unknown>(
    `https://hymnary.org/api/scripture?reference=${reference}`,
  );
  if (!Array.isArray(payload)) return [];

  const hits: HymnaryHit[] = [];
  for (const item of payload) {
    if (!item || typeof item !== 'object') continue;
    const rec = item as Record<string, unknown>;
    const title = asString(rec.title ?? rec['text title'] ?? rec['first line']);
    if (!title) continue;
    const link = asString(rec['text link'] ?? rec.textLink ?? rec.link ?? rec.url);
    hits.push({
      title,
      url: link
        ? link.startsWith('http')
          ? link
          : `https://hymnary.org${link.startsWith('/') ? '' : '/'}${link}`
        : `https://hymnary.org/search?qu=${encodeURIComponent(title)}`,
      hymnalCount: asCount(rec['number of hymnals'] ?? rec.numberOfHymnals),
    });
  }
  return hits.sort((a, b) => b.hymnalCount - a.hymnalCount).slice(0, limit);
}
