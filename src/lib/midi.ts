// Tune playback / listening helpers.
//
// Reliable cross-origin MIDI playback isn't achievable on a static host: the
// free tune pages (Hymnary etc.) are HTML, not `.mid` files, and direct MIDI
// files are CORS-restricted. So the default experience is a "hear the tune"
// link that opens the tune's page or a sung performance — navigation isn't
// subject to CORS, so this works everywhere and offline-degrades to a link.
//
// True embedded playback is supported only for a genuine same-origin MIDI file
// (a tune's `midiFile`, bundled under public/midi/ — public domain, credited
// in public/midi/CREDITS.md). When present, a lightweight player is loaded on
// demand; when absent, the heavy player bundle is never fetched.

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

/** True when a tune has a real, same-origin MIDI file we can embed and play. */
export function tuneHasPlayableMidi(tune: Tune | undefined): boolean {
  return Boolean(tune?.midiFile);
}

/**
 * The URL of a tune's bundled same-origin MIDI file (playable offline and in
 * the embedded player), or undefined when none is bundled.
 */
export function tuneMidiUrl(tune: Tune | undefined): string | undefined {
  if (tune?.midiFile) return `${import.meta.env.BASE_URL}midi/${tune.midiFile}`;
  return undefined;
}

/**
 * The best link to hear a tune: its dedicated info/listen page when known,
 * otherwise a YouTube search for the tune name (most hymn tunes have sung
 * recordings there). Always returns a usable URL.
 */
export function listenUrl(tune: Tune | undefined, hymnTitle: string): string {
  if (tune?.listenUrl) return tune.listenUrl;
  const query = tune?.name ? `${tune.name} hymn tune` : `${hymnTitle} hymn`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

/** Whether the listen link points at a curated tune page (vs a search). */
export function hasCuratedListenPage(tune: Tune | undefined): boolean {
  return Boolean(tune?.listenUrl);
}
