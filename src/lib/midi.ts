// Tune playback / listening helpers.
//
// Reliable cross-origin MIDI playback isn't achievable on a static host: the
// free tune pages (Hymnary etc.) are HTML, not `.mid` files, and direct MIDI
// files are CORS-restricted. So the default experience is a "hear the tune"
// link that opens the tune's page or a sung performance — navigation isn't
// subject to CORS, so this works everywhere and offline-degrades to a link.
//
// True embedded playback is supported only for a genuine same-origin MIDI file
// (a tune's `midiFile`, e.g. one bundled under public/tunes/). When present, a
// lightweight player is loaded on demand; when absent, the heavy player bundle
// is never fetched — which is why no tracking/CDN noise appears by default.

import type { Tune } from '../data/hymns';

const PLAYER_CDN =
  'https://cdn.jsdelivr.net/combine/npm/tone@14.7.77,npm/@magenta/music@1.23.1/es6/core.js,npm/focus-visible@5,npm/html-midi-player@1.5.0';

let loaderPromise: Promise<void> | null = null;

/** Lazily load the html-midi-player web component. Safe to call repeatedly. */
export function loadMidiPlayer(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (customElements.get('midi-player')) return Promise.resolve();
  if (loaderPromise) return loaderPromise;
  loaderPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = PLAYER_CDN;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not load MIDI player'));
    document.head.appendChild(script);
  });
  return loaderPromise;
}

export function tuneHasMidi(tune: Tune | undefined): boolean {
  return Boolean(tune?.midiFile || tune?.midiUrl);
}

/**
 * The playable/openable MIDI URL for a tune. Bundled public-domain files
 * (public/midi/, credited in public/midi/CREDITS.md) win over external links
 * because they work offline and can be embedded in the player directly.
 */
export function tuneMidiUrl(tune: Tune | undefined): string | undefined {
  if (tune?.midiFile) return `${import.meta.env.BASE_URL}midi/${tune.midiFile}`;
  return tune?.midiUrl;
}

/** Whether the listen link points at a curated tune page (vs a search). */
export function hasCuratedListenPage(tune: Tune | undefined): boolean {
  return Boolean(tune?.listenUrl);
}
