// LectServe client — Revised Common Lectionary readings for a date.
// https://www.lectserve.com/  (free, JSON, no key)
//
// LectServe's response shape has varied over time (single day vs. multiple
// services), so rather than depending on one exact schema we hunt the payload
// for reading-like strings and keep only those that parse as real scripture
// references. Anything unreachable or unparseable falls back to the local
// curated table, and finally to the official C of E lectionary link the UI
// already shows.

import { cachedJson } from './http';
import { parseScriptureRef, labelRef } from './scriptureParse';
import { getReadings, type ScriptureRef } from '../../data/readings';
import type { LiturgicalDay } from '../../data/calendar';

export interface LectionaryResult {
  refs: ScriptureRef[];
  /** Where the readings came from. */
  source: 'lectserve' | 'local' | 'none';
}

const READING_KEYS = /^(readings?|lessons?|lections?)$/i;

/** Recursively collect candidate reading strings from an unknown payload. */
function huntReadings(node: unknown, underReadingKey: boolean, out: string[]): void {
  if (typeof node === 'string') {
    if (underReadingKey) out.push(node);
    return;
  }
  if (Array.isArray(node)) {
    for (const item of node) huntReadings(item, underReadingKey, out);
    return;
  }
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      huntReadings(value, underReadingKey || READING_KEYS.test(key), out);
    }
  }
}

function dedupe(refs: ScriptureRef[]): ScriptureRef[] {
  const seen = new Set<string>();
  return refs.filter((r) => {
    const k = `${r.book}|${r.passage}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/**
 * Readings for the day: LectServe first (when online sources are enabled),
 * then the local curated table.
 */
export async function fetchDayReadings(
  day: LiturgicalDay,
  online: boolean,
): Promise<LectionaryResult> {
  const local = getReadings(day);

  if (online) {
    const iso = `${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, '0')}-${String(day.date.getDate()).padStart(2, '0')}`;
    const payload = await cachedJson<unknown>(
      `https://www.lectserve.com/date/${iso}?lect=rcl`,
      { ttlMs: 30 * 24 * 3600_000 },
    );
    if (payload) {
      const candidates: string[] = [];
      huntReadings(payload, false, candidates);
      const refs = dedupe(
        candidates
          .flatMap((s) => s.split(/\s+or\s+|;/i)) // split alternates
          .map((s) => parseScriptureRef(s))
          .filter((r): r is ScriptureRef => r !== null)
          .map(labelRef),
      );
      if (refs.length > 0) return { refs, source: 'lectserve' };
    }
  }

  if (local) return { refs: local.principal, source: 'local' };
  return { refs: [], source: 'none' };
}
