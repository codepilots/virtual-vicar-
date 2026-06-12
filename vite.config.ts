import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Base path is configurable so the app can be served from a sub-path
// (e.g. GitHub Pages project sites) or from the root.
const base = process.env.VV_BASE ?? '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      // Precache the bundled public-domain hymn MIDIs so "Play the tune"
      // works offline (the files total ~350 kB).
      workbox: { globPatterns: ['**/*.{js,css,html,svg,mid}'] },
      manifest: {
        name: 'Virtual Vicar',
        short_name: 'Vicar',
        description:
          'Prepare and lead a Church of England service — readings, collect, hymns and a step-by-step guide.',
        theme_color: '#3b2a6b',
        background_color: '#f7f4ee',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '.',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
    }),
  ],
});
