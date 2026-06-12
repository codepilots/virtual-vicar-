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
| Correct readings & collect for the day | `src/data/calendar.ts` computes the liturgical day → live RCL readings via the LectServe API, falling back to the local table and deep‑links to the official C of E lectionary/collects |
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

## No‑backend extras

These work entirely in the browser — no server, no API key:

- **Offline psalms** — the public‑domain **Coverdale Psalter** (`psalter.ts`) is
  bundled for 33 of the most‑appointed psalms, so a *whole‑psalm* slot shows the
  text and reads aloud offline; verse ranges keep their Bible link (so nothing
  is shown out of context).
- **BCP collects** — the full 1662 Collects of the Day (`collects.ts`, public
  domain): Advent through Trinity 24 plus Stir‑up, with weekday/feast aliases
  and weeks‑after‑Trinity computed from the date of Easter (the calendar keys
  Ordinary Time by Proper number; the BCP keys by Trinity week). Every day of
  the year resolves offline on the Prayer Book path.
- **Provenance marking** — bundled BCP texts, collects and psalms are
  hand‑transcribed and carry `verified`/`unverified` flags until proofread
  against a printed copy; the UI marks them ⚠ wherever they appear (run mode,
  wizard, print sheet), and Settings → *About & sources* lists all credits.
- **Printable order of service** — `PrintSheet` assembles the whole plan into a
  clean document for the leader or printed pew sheets (`window.print()` → PDF).
- **Run‑mode practicalities** — Screen Wake Lock keeps the phone awake while
  leading; on‑the‑fly **A− / A+** text sizing (and a Settings default); and an
  **estimated duration** shown on the review screen and counting down in run mode.
- **Share & back up** — a plan encodes into a shareable URL (`#plan=…`) or a
  downloadable JSON file, and reads back from either — so a leader can text the
  plan to a colleague or keep a backup, with no accounts.

## Online sources (`src/lib/api/`)

Three keyless, browser-callable APIs are integrated, all behind a single
**Settings → Online sources** toggle. Every response is cached in
localStorage with a TTL, so a service prepared at home on wi‑fi still works
in a poorly connected church. Every failure path (offline, CORS, timeout,
schema drift) falls back to the local data and official link-outs.

| API | Used for | Module |
| --- | --- | --- |
| [LectServe](https://www.lectserve.com/) | RCL readings for the chosen date — fills the wizard's readings step and the run-mode reading/psalm slots | `lectionary.ts` |
| [bible-api.com](https://bible-api.com/) | The passage text itself, shown (and TTS-readable) in run mode for public-domain versions (KJV, WEB); copyrighted versions stay link-out only | `bibleText.ts` |
| [Hymnary.org scripture API](https://hymnary.org/api/scripture) | Hymn suggestions that match the day's readings, alongside the local season-based suggester | `hymnary.ts` |
| RSS/Atom feeds | Latest posts/episodes from curated Anglican blogs & podcasts (Psephizo, Thinking Anglicans, ViaMedia, Covenant, Sermon Brainwave, GodPod…), shown inline on the address step. Direct fetch first, then the AllOrigins public CORS passthrough; failures fall back to the site link | `rss.ts` |

LectServe's payload shape has varied over time, so the client hunts the JSON
for reading-like strings and keeps only those that parse as real scripture
references (`scriptureParse.ts`, validated against a canonical book list).

**Future (need an API key → small serverless proxy):** API.Bible for
NRSV/NIV in-app text, neural TTS (Azure/Polly/ElevenLabs) for a more natural
voice, and the Claude API to draft a reflection from the day's readings.

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
