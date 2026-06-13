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
   right licence (most do for local reproduction), either paste the whole
   day's service in one go in the wizard (the "⚡ Paste the whole service"
   box parses it into the right sections), paste per-section, or drop the
   texts permanently into `src/data/services.ts`. Otherwise the BCP services
   are fully usable today.
   - [x] ~~Whole-service parser handles Morning Prayer, Prayer During the Day
         and Evening Prayer, on both Sundays and weekdays — verified against the
         saved pastes in `local/`. Each office's section structure is constant
         across weekdays (only the content differs), so one template per office
         covers every day.~~
   - [ ] Confirm the deep-linked C of E page URLs resolve live for each office
         (esp. the new `prayer-during-the-day-…` slug).
   - [x] ~~Typesetting of pasted text reworked: clipboard soft-wraps are
         rejoined, rubrics/attributions/alternative markers no longer render as
         bold responses, mid-line "Refrain:" is split out, and a psalm-collect
         the clipboard runs straight on from the last verse (the glued
         "…God.Come, creator Spirit…", with no verse number) is split off as
         following prose.~~
   - [x] ~~"or" alternatives in a pasted section (Lord's Prayer
         contemporary/traditional, opening-prayer forms, hymn/canticle) can be
         pre-chosen in wizard step 2; run mode/print then show only the picked
         form (default keeps all). Psalm/reading slots are left alone.~~
   - [x] ~~Cross-references in the paste ("(page 108)", "pages 362–371", and
         "(link is external)" web links) are stripped from the rendered text and
         surfaced per-section in the wizard as Common Worship lookups, keyed off
         the page number (the reliable anchor). A curated index in
         `cwReferences.ts` (`CW_INDEX`) deep-links the known resources straight
         to daily.commonworship.com (Acclamation, Blessing of Light, canticles
         by page, prayer cycles, intercession forms); anything not yet indexed
         falls back to a Common Worship search. Extend `CW_INDEX` as more page
         numbers turn up.~~
4. **Pick a deployment domain** if GitHub Pages isn't wanted (Netlify/Vercel
   also work; unset `VV_BASE` for a root domain).

## 🟡 Next builds (good candidates for the next session)

- **Plan templates & history** — save more than one plan; "duplicate last
  Evensong"; recently-used hymns surfaced first.
- **Saints' days & festivals** — extend `calendar.ts` beyond Sundays and
  principal feasts (Michaelmas, patronal festivals, BVM, apostles…)
  with their collects and readings.
- **Configurable intercessions** — ~~choose prepared prayers in the wizard (not
  just at run time)~~ done: the Prayers section in wizard step 2 now takes your
  biddings/outline and which prepared forms to have ready; run mode and the
  print sheet show only those. Still to do: seasonal litany forms; local names
  list (sick/departed) saved per parish.
- ~~**The Reflection (address)**~~ — done: gated behind a Settings toggle (with
  a Canon B 18 reminder); renamed from “Sermon / Address”; sources are now
  configurable in Settings (hide built-ins, add/remove your own); selecting a
  feed item drops its body into the notes; a chosen podcast episode plays in
  one tap in run mode (`<audio>`, media channel — works on iOS regardless of the
  silent switch) with a best-effort “Save for offline” (Cache API +
  `vv-recordings` workbox runtime cache; reliable only for CORS-friendly hosts).
- ~~**iOS hymn MIDI silent / no audio**~~ — mitigated: `armAudioUnlock()` resumes
  Web Audio on first tap and a UI note flags the silent switch (Web Audio is
  muted by it on iOS). Not fully verifiable without a device; the @magenta
  player owns its own audio context, so if it persists, the fallback is to
  prefer the recording/“hear the tune” link on iOS.
- ~~**Usability pass**~~ — done: wizard edits autosave (no loss on “‹ Home”);
  confirm before a service switch wipes work; per-step wizard page with a
  labelled, tappable stepper; run-mode step-jump list; mute/“Voice” toggle in
  run mode; tappable “Your defaults” + first-run nudge; reset-to-defaults in
  Settings. Still open: split the long Settings page with in-page anchors.
- ~~**Accessibility pass**~~ — done: pinch-zoom re-enabled; clickable cards are
  keyboard-operable buttons (`pressable`, `aria-pressed`); `:focus-visible`
  rings; skip-to-content link; `aria-current` stepper; run-mode `aria-live`
  step announcements; `prefers-reduced-motion`. Body/muted text contrast checked
  (~5.1:1, passes AA). Still open: an automated axe/Lighthouse run on a device.
- **Expand the Coverdale Psalter** to all 150 (and support verse-range
  display once the texts carry per-verse structure).
- **Hymn catalogue at scale** — import a proper index (e.g. from Hymnary data
  exports) instead of the hand-curated ~50; per-book number verification.
- ~~**Bundle tune MIDIs for in-app playback**~~ — done: 33 public-domain
  tunes from the Open Hymnal Project ship under `public/midi/` with
  `Tune.midiFile` set (credits in `public/midi/CREDITS.md`); the embedded
  player runs for these, and other tunes keep the listen link-out.
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
