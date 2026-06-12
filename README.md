# Virtual Vicar

A mobile-first, installable web app (PWA) that acts as a **virtual vicar** for a
Church of England parish. It helps a **lay person prepare and lead a service**
that a lay person may lawfully take — guiding them step by step, or taking the
officiant's voice directly via text‑to‑speech.

> **Scope & safeguard:** the app only offers offices a lay person may lead —
> Morning Prayer, Evening Prayer, Night Prayer (Compline) and *A Service of the
> Word*. It deliberately does **not** include Holy Communion / the Eucharist,
> which requires a priest. Always follow your incumbent's guidance.

## What it does

| Requirement | How it's met |
| --- | --- |
| Choose from a list of suitable (lay-led) services | `src/data/services.ts` (Common Worship offices) + `src/data/bcp.ts` (BCP 1662 Mattins & Evensong, full text) |
| Indicate which optional parts to include / omit | Wizard step 2 — every optional section has a toggle; fixed parts are locked on |
| Correct readings & collect for the day | `src/data/calendar.ts` computes the liturgical day → `readings.ts` / `collects.ts` resolve them, with deep‑links to the official C of E lectionary/collects as a guaranteed fallback |
| Choice of Bible versions, linked to book/chapter/verse | `src/data/bibleVersions.ts` builds passage URLs (NRSVA, NIVUK, ESV, KJV, CEV, MSG…) |
| Suggest hymns; user configures which hymn books are available | Hymn books chosen in **Settings**; `suggestHymns()` only proposes hymns you own and scores them by season & congregation |
| Locate a MIDI for the tune; multiple settings; verses/choruses & order | `HymnPicker` — pick the tune/setting, number of verses, whether to sing the chorus, and the exact order (e.g. `v1, chorus, v2`) |
| Option to play the MIDI or not | Per‑hymn "Play the tune" toggle; an embedded MIDI player loads on demand, with an open/download link fallback |
| As many or few hymns as you like | Each hymn slot is independent and removable |
| Address: suggest blogs/podcasts from notable Anglican voices | `src/data/addressResources.ts` + your own notes field |
| Filter by kind of congregation | Congregation type (traditional, contemporary, all‑age, family, cathedral, small/rural) filters hymn & address suggestions |
| Easy, step‑by‑step run mode with a Skip option | `RunMode` — one card at a time, **Skip** on every step, optional spoken officiant parts (TTS) |

## Running locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build to dist/
npm run preview    # serve the production build
npm run typecheck  # strict TypeScript check
```

It's a PWA: open it on a phone and "Add to Home Screen" to install. It works
offline; deep‑links (Bible passages, MIDI files, lectionary) need a connection.

## Architecture

```
src/
  data/        Content & domain data (no UI)
    calendar.ts        Liturgical engine: computus, seasons, feasts, RCL A/B/C
                       + Daily Office year, Proper numbers
    collects.ts        Collects by day id  (+ official link fallback)
    readings.ts        Lectionary refs by day id & year (+ official link fallback)
    services.ts        The four lay-led offices as ordered, optional-flagged sections
    bibleVersions.ts   Bible versions + passage URL builders
    hymns.ts           Hymn books, hymns, tunes, MIDI, season/congregation suggester
    addressResources.ts Blogs/podcasts for the address, filtered by congregation
    congregation.ts    Congregation types
  lib/         Logic
    plan.ts            Build a plan; resolve ordered run steps
    storage.ts         Persist settings & plan (localStorage)
    tts.ts             Web Speech "vicar voice"
    midi.ts            Lazy MIDI player loader + search links
    types.ts           Shared types
  components/  React UI (Home, SettingsScreen, Wizard, HymnPicker, RunMode, DayBanner)
```

The **liturgical calendar engine is fully implemented and verified** (Easter
computus, movable feasts, seasons, Sunday naming, Proper numbers, and both the
Sunday RCL year and the Daily Office year).

## Content: complete vs scaffolded

**Complete and shipping with full text:**

- **Book of Common Prayer (1662)** — Morning Prayer (Mattins) and Evening
  Prayer (Evensong) in `src/data/bcp.ts`, with the full public‑domain wording:
  the Exhortation, General Confession, Venite, Te Deum, Benedictus, Magnificat,
  Nunc Dimittis, Apostles' Creed, Suffrages, the three Collects, the Prayer of
  St Chrysostom and the Grace. The one priestly act (the Absolution) is handled
  with a rubric so a lay person leads correctly.

**Scaffolded** (structured data + illustrative entries + official deep‑links so
every day still resolves) — these contain modern, copyright material, so populate
them with data you are licensed to use:

- **Common Worship liturgy wording** in `services.ts` (section `text` placeholders)
- **Collects** in `collects.ts`
- **Lectionary readings** in `readings.ts`
- **Hymn catalogue / MIDI URLs** in `hymns.ts`

The data *shapes* are complete, so the wizard and run mode work end‑to‑end.

## Licence & attribution

Liturgical texts from *Common Worship* are © The Archbishops' Council; Bible
text and hymn material are © their respective owners. This app links out to
official sources and ships no copyrighted text. Code is provided as‑is for
parish use.
