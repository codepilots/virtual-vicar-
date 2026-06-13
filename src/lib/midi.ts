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

// iOS Safari starts Web Audio suspended and only lets it run after a user
// gesture; it also routes Web Audio through the ring/silent switch. The MIDI
// player (Tone.js / @magenta) creates its context lazily, so on the first tap
// we resume a context (and Tone, if exposed) and play a silent buffer to
// unlock playback. Harmless elsewhere. (The silent switch caveat is shown in
// the UI — recordings use the media channel and aren't affected.)
let audioUnlockArmed = false;
export function armAudioUnlock(): void {
  if (audioUnlockArmed || typeof window === 'undefined') return;
  audioUnlockArmed = true;
  const w = window as unknown as {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
    Tone?: { start?: () => void; context?: { resume?: () => void } };
  };
  const unlock = () => {
    try {
      const Ctx = w.AudioContext ?? w.webkitAudioContext;
      if (Ctx) {
        const ctx = new Ctx();
        void ctx.resume?.();
        const src = ctx.createBufferSource();
        src.buffer = ctx.createBuffer(1, 1, 22050);
        src.connect(ctx.destination);
        src.start(0);
      }
      w.Tone?.start?.();
      w.Tone?.context?.resume?.();
    } catch {
      /* best effort */
    }
    document.removeEventListener('pointerdown', unlock);
    document.removeEventListener('touchend', unlock);
  };
  document.addEventListener('pointerdown', unlock, { once: true });
  document.addEventListener('touchend', unlock, { once: true });
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
