# Virtual Vicar — TODO & Roadmap

A working list of what needs human action, what's worth building next, and
ideas parked for later. (See `README.md` for what's already built.)

## 🔴 Actions for you (can't be done from the build environment)

1. **Test in a real browser / on a phone.** The build sandbox blocks outbound
   network, so none of the online integrations have been exercised live:
   - [ ] Enable GitHub Pages: repo **Settings → Pages → Source: "GitHub
         Actions"**, then merge to `main` (the workflow in
         `.github/workflows/deploy.yml` builds and deploys automatically).
   - [ ] LectServe readings load on the wizard's readings step
   - [ ] bible-api.com passage text appears in run mode (KJV or WEB selected)
   - [ ] Hymnary "matching today's readings" suggestions appear (may be
         CORS-blocked — if so, remove or proxy `src/lib/api/hymnary.ts`)
   - [ ] Each RSS feed loads ("Show latest posts" on the address step); fix
         any wrong feed URL in `src/data/addressResources.ts` and flip
         `feedVerified: true`
   - [x] ~~MIDI player loads from the CDN and plays~~ — reworked: tune pages
         aren't MIDI files and cross-origin MIDI is CORS-blocked, so the app
         now links out to "Hear the tune" (Hymnary page or YouTube search).
         Embedded playback only runs for a genuine same-origin `.mid`
         (`Tune.midiFile`) — see "bundle tune MIDIs" below.
   - [ ] TTS voices, wake lock, and Add-to-Home-Screen on a real phone
2. **Proofread the transcribed texts against printed copies** (all marked ⚠
   in the app). Flip the flags as you verify:
   - [ ] BCP Mattins/Evensong texts — `src/data/bcp.ts`
   - [ ] BCP collects — `verified: true` per entry in `src/data/collects.ts`
   - [ ] Coverdale psalms — `src/data/psalter.ts`
   - [ ] Prepared prayers — `src/data/prayers.ts`
   - [ ] Hymn book numbers — `src/data/hymns.ts` (check against your actual
         NEH / A&M / MP editions; editions differ!)
3. **Decide on Common Worship texts.** The CW services are placeholders
   because the text is © The Archbishops' Council. If the parish holds the
   right licence (most do for local reproduction), drop the texts into
   `src/data/services.ts`. Otherwise the BCP services are fully usable today.
4. **Pick a deployment domain** if GitHub Pages isn't wanted (Netlify/Vercel
   also work; unset `VV_BASE` for a root domain).

## 🟡 Next builds (good candidates for the next session)

- **Plan templates & history** — save more than one plan; "duplicate last
  Evensong"; recently-used hymns surfaced first.
- **Saints' days & festivals** — extend `calendar.ts` beyond Sundays and
  principal feasts (Michaelmas, patronal festivals, BVM, apostles…)
  with their collects and readings.
- **Configurable intercessions** — choose prepared prayers in the wizard (not
  just at run time); seasonal litany forms; local names list (sick/departed)
  saved per parish.
- **Expand the Coverdale Psalter** to all 150 (and support verse-range
  display once the texts carry per-verse structure).
- **Hymn catalogue at scale** — import a proper index (e.g. from Hymnary data
  exports) instead of the hand-curated ~50; per-book number verification.
- **Bundle tune MIDIs for in-app playback** — drop public-domain `.mid` files
  under `public/tunes/` and set `Tune.midiFile`; same-origin means no CORS and
  the embedded player works. (The link-out covers listening meanwhile.)
- **Second/Third Service lectionary** — LectServe gives the Principal
  Service; Evensong properly wants the Second Service readings.

## 🟢 Parked ideas (bigger lifts / need a server or keys)

- **Neural TTS "vicar voice"** (Azure / Polly / ElevenLabs) — needs an API
  key behind a small serverless proxy.
- **API.Bible integration** — NRSV/NIV text in-app (key + proxy; licence
  terms apply).
- **Claude-drafted reflection** — generate an address outline from the day's
  readings and congregation type (key + proxy).
- **Projection mode** — cast/secondary-screen output of the words for the
  congregation, controlled from the phone.
- **Rota & multi-user** — share plans with readers/musicians with roles;
  needs accounts/backend (the URL-share covers the simple case now).
- **Service register** — log services taken, attendance, preacher, for the
  parish records.
- **Self-hosted CORS proxy** — replace the AllOrigins passthrough for feeds
  (one tiny Cloudflare Worker) and unlock Hymnary if it proves CORS-blocked.
- **Recorded audio liturgy** — real recordings instead of TTS for fixed
  texts (the BCP texts are stable enough to record once).

## Known limitations (by design, documented in-app)

- Lay-led services only; no Holy Communion.
- CW liturgy text is placeholder pending licensing (see above).
- Whole-psalm display only from the bundled psalter; verse ranges link out.
- The BCP "Sundays after Trinity" collect mapping clamps beyond Trinity 24
  to Stir-up rather than implementing the BCP's reuse-omitted-Epiphany rule.
- Feed reading depends on publishers' CORS or the AllOrigins passthrough.
