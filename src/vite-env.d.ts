/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

import type { DetailedHTMLProps, HTMLAttributes } from 'react';

// The html-midi-player web component, loaded lazily from a CDN at runtime.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'midi-player': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        'sound-font'?: string;
      };
    }
  }
}

export {};
