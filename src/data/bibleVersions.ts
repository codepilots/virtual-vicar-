// Bible versions and deep-link builders.
//
// Each version knows how to turn a structured scripture reference (book,
// chapter, verses) into a URL on an online Bible site, opened to the correct
// passage. Two providers are supported per version where available.

import type { ScriptureRef } from './readings';

export interface BibleVersion {
  id: string;
  /** Display name, e.g. "New Revised Standard Version (Anglicized)". */
  name: string;
  /** Short code shown in compact UI, e.g. "NRSVA". */
  code: string;
  /** Whether this version is widely used in C of E lectionary contexts. */
  recommended?: boolean;
  /** Builds a URL to the passage on an online Bible site. */
  url: (ref: ScriptureRef) => string;
}

// Normalise a passage like "13.1–13" to BibleGateway's "13:1-13" style.
function normalisePassage(passage: string): string {
  return passage.replace(/[–—]/g, '-').replace(/\./g, ':');
}

function bibleGateway(versionCode: string) {
  return (ref: ScriptureRef): string => {
    const search = encodeURIComponent(`${ref.book} ${normalisePassage(ref.passage)}`);
    return `https://www.biblegateway.com/passage/?search=${search}&version=${versionCode}`;
  };
}

export const BIBLE_VERSIONS: BibleVersion[] = [
  { id: 'nrsva', name: 'New Revised Standard Version (Anglicized)', code: 'NRSVA', recommended: true, url: bibleGateway('NRSVA') },
  { id: 'niv-uk', name: 'New International Version (UK)', code: 'NIVUK', recommended: true, url: bibleGateway('NIVUK') },
  { id: 'esv', name: 'English Standard Version (Anglicised)', code: 'ESVUK', url: bibleGateway('ESVUK') },
  { id: 'kjv', name: 'King James Version', code: 'KJV', url: bibleGateway('KJV') },
  { id: 'cev', name: 'Contemporary English Version', code: 'CEV', url: bibleGateway('CEV') },
  { id: 'msg', name: 'The Message', code: 'MSG', url: bibleGateway('MSG') },
];

export function getBibleVersion(id: string): BibleVersion | undefined {
  return BIBLE_VERSIONS.find((v) => v.id === id);
}
