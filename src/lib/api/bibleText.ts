// bible-api.com client — fetches actual passage text for display (and TTS)
// inside the app. Keyless, CORS-friendly, public-domain translations only
// (KJV, WEB, ASV…), so copyrighted versions such as NRSV/NIV remain link-out
// only via the existing BibleGateway deep links.

import { cachedJson } from './http';
import { getBibleVersion } from '../../data/bibleVersions';
import type { ScriptureRef } from '../../data/readings';

interface BibleApiResponse {
  reference?: string;
  text?: string;
  translation_name?: string;
  verses?: { text?: string }[];
}

export interface PassageText {
  reference: string;
  text: string;
  translationName: string;
}

/** Can this Bible version's text be fetched and shown in-app? */
export function supportsInlineText(versionId: string): boolean {
  return Boolean(getBibleVersion(versionId)?.apiId);
}

/**
 * Fetch the text of a passage in the user's version, when that version has a
 * public-domain source on bible-api.com. Returns null otherwise (the UI keeps
 * its deep link to an online Bible instead).
 */
export async function fetchPassageText(
  ref: ScriptureRef,
  versionId: string,
): Promise<PassageText | null> {
  const apiId = getBibleVersion(versionId)?.apiId;
  if (!apiId || !ref.passage) return null;

  // "13.1–13" → "13:1-13", as bible-api expects.
  const passage = ref.passage.replace(/[–—]/g, '-').replace(/\./g, ':');
  const url = `https://bible-api.com/${encodeURIComponent(`${ref.book} ${passage}`)}?translation=${apiId}`;
  const res = await cachedJson<BibleApiResponse>(url, { ttlMs: 30 * 24 * 3600_000 });
  if (!res) return null;

  const text = (res.text ?? res.verses?.map((v) => v.text ?? '').join(' ') ?? '').trim();
  if (!text) return null;
  return {
    reference: res.reference ?? `${ref.book} ${ref.passage}`,
    text: text.replace(/\s+\n/g, '\n').replace(/[ \t]+/g, ' '),
    translationName: res.translation_name ?? versionId.toUpperCase(),
  };
}
