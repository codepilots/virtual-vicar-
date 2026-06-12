// React hooks over the online clients. Each hook resolves once per input
// change, never throws, and reports where its data came from so the UI can be
// honest about online vs offline sources.

import { useEffect, useState } from 'react';
import { fetchDayReadings, type LectionaryResult } from './lectionary';
import { fetchPassageText, supportsInlineText, type PassageText } from './bibleText';
import { fetchHymnsForReading, type HymnaryHit } from './hymnary';
import { dayFromIso } from '../plan';
import type { ScriptureRef } from '../../data/readings';

export interface DayReadingsState extends LectionaryResult {
  loading: boolean;
}

/** Readings for a date — LectServe when online, local table otherwise. */
export function useDayReadings(dateIso: string, online: boolean): DayReadingsState {
  const [state, setState] = useState<DayReadingsState>({
    refs: [],
    source: 'none',
    loading: true,
  });

  useEffect(() => {
    let live = true;
    setState((s) => ({ ...s, loading: true }));
    fetchDayReadings(dayFromIso(dateIso), online).then((result) => {
      if (live) setState({ ...result, loading: false });
    });
    return () => {
      live = false;
    };
  }, [dateIso, online]);

  return state;
}

/** Passage text in the user's version, when it has a public-domain source. */
export function usePassageText(
  ref: ScriptureRef | undefined,
  versionId: string,
  online: boolean,
): PassageText | null {
  const [text, setText] = useState<PassageText | null>(null);
  const key = ref ? `${ref.book} ${ref.passage}` : '';

  useEffect(() => {
    let live = true;
    setText(null);
    if (!ref || !online || !supportsInlineText(versionId)) return;
    fetchPassageText(ref, versionId).then((result) => {
      if (live) setText(result);
    });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, versionId, online]);

  return text;
}

/** Hymnary.org hymns associated with a reading (Gospel preferred). */
export function useHymnaryHits(refs: ScriptureRef[], online: boolean): HymnaryHit[] {
  const [hits, setHits] = useState<HymnaryHit[]>([]);
  const best =
    refs.find((r) => r.label === 'Gospel') ??
    refs.find((r) => r.label !== 'Psalm') ??
    refs[0];
  const key = best ? `${best.book} ${best.passage}` : '';

  useEffect(() => {
    let live = true;
    setHits([]);
    if (!best || !online) return;
    fetchHymnsForReading(best).then((result) => {
      if (live) setHits(result);
    });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, online]);

  return hits;
}
