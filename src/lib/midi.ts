// MIDI helpers. Browsers cannot play MIDI natively, so we offer two things:
//  1. a link to open/download the tune's MIDI file, and
//  2. an optional embedded player via the `html-midi-player` web component,
//     loaded lazily from a CDN only when the user chooses to play.
//
// If the device is offline or the CDN is blocked, the link-out still works.

import type { Tune } from '../data/hymns';

const PLAYER_CDN = 'https://cdn.jsdelivr.net/combine/npm/tone@14.7.77,npm/@magenta/music@1.23.1/es6/core.js,npm/focus-visible@5,npm/html-midi-player@1.5.0';

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

/** A user-facing search link to find a MIDI when one isn't catalogued. */
export function midiSearchUrl(tuneName: string): string {
  return `https://hymnary.org/search?qu=${encodeURIComponent(tuneName)}%20media%3Amidi`;
}
