// Hymn books, hymns, tunes and MIDI lookup.
//
// The user configures which hymn books they own (see Settings). The suggester
// then proposes hymns appropriate to the season and congregation type, and for
// each hymn finds the book number in the user's books and a MIDI file for the
// tune. A hymn may have more than one tune ("setting"); the user picks one and
// configures the number of verses/choruses and their order.

import type { Season } from './calendar';
import type { CongregationType } from './congregation';

export interface HymnBook {
  id: string;
  name: string;
  abbreviation: string;
}

export interface Tune {
  id: string;
  name: string;
  /** Metre, e.g. "87.87.87". */
  metre?: string;
  /** A page where the tune can be heard/viewed (opened as a link, not fetched). */
  listenUrl?: string;
  /**
   * A genuine, same-origin MIDI file (e.g. bundled under public/tunes/) that
   * can be embedded and played. Cross-origin MIDI is not used — it is
   * CORS-blocked on a static host. None bundled yet; the UI links out instead.
  /** A URL to a MIDI rendering of the tune, where known. */
  midiUrl?: string;
  /**
   * Filename of a bundled public-domain MIDI in public/midi/ (from the Open
   * Hymnal Project — see public/midi/CREDITS.md for per-tune credits).
   * Preferred over midiUrl: it works offline and embeds in the player.
   */
  midiFile?: string;
}

export interface Hymn {
  id: string;
  title: string;
  firstLine: string;
  /** Number of sung verses in the canonical text. */
  verses: number;
  /** True if the hymn has a refrain/chorus. */
  hasChorus?: boolean;
  /** Seasons the hymn suits. Empty = suitable any time. */
  seasons: Season[];
  /** Congregation types the hymn suits. Empty = suits all. */
  congregations: CongregationType[];
  /** Available tunes / settings. */
  tunes: Tune[];
  /** Book id -> hymn number, for books that contain it. */
  numbers: Record<string, number>;
}

export const HYMN_BOOKS: HymnBook[] = [
  { id: 'am', name: 'Hymns Ancient & Modern', abbreviation: 'A&M' },
  { id: 'neh', name: 'The New English Hymnal', abbreviation: 'NEH' },
  { id: 'mp', name: 'Mission Praise', abbreviation: 'MP' },
  { id: 'ssp', name: 'Sing the Faith / Songs of Fellowship', abbreviation: 'SoF' },
  { id: 'cp', name: 'Common Praise', abbreviation: 'CP' },
  { id: 'hon', name: 'Hymns Old & New', abbreviation: 'HON' },
];

// A curated catalogue of widely-sung hymns across the church year.
//
// PROVENANCE: hymn-book numbers are hand-entered from a working index and are
// NOT yet verified against printed copies — the picker says so and shows the
// title so a leader can check the book's own index. Hymns with no numbers
// listed still appear (ranked lower) since most appear in every major book.
// `midiFile` names a bundled public-domain MIDI in public/midi/ — all from
// the Open Hymnal Project (openhymnal.org), individually verified "public
// domain" in their ABC sources; see public/midi/CREDITS.md for per-tune
// credits. `midiUrl` points at Hymnary.org tune pages where a MIDI is
// commonly available; tunes with neither get a search link instead.
export const HYMNS: Hymn[] = [
  // ---- Advent ----
  { id: 'come-thou-long-expected', title: 'Come, thou long expected Jesus', firstLine: 'Come, thou long expected Jesus', verses: 2, seasons: ['Advent'], congregations: [], tunes: [{ id: 'cross-of-jesus', name: 'Cross of Jesus', metre: '87.87', midiUrl: 'https://hymnary.org/tune/cross_of_jesus_stainer' }, { id: 'stuttgart', name: 'Stuttgart', metre: '87.87' }], numbers: { neh: 3, am: 32 } },
  { id: 'o-come-o-come-emmanuel', title: 'O come, O come, Emmanuel', firstLine: 'O come, O come, Emmanuel', verses: 5, hasChorus: true, seasons: ['Advent'], congregations: [], tunes: [{ id: 'veni-emmanuel', name: 'Veni Emmanuel', metre: '88.88 with refrain', midiFile: 'veni-emmanuel.mid' }], numbers: { neh: 11, am: 39, mp: 493 } },
  { id: 'lo-he-comes', title: 'Lo! he comes with clouds descending', firstLine: 'Lo! he comes with clouds descending', verses: 4, seasons: ['Advent'], congregations: [], tunes: [{ id: 'helmsley', name: 'Helmsley', metre: '87.87.47', midiFile: 'helmsley.mid' }], numbers: { neh: 9, am: 34 } },
  { id: 'hark-the-glad-sound', title: 'Hark the glad sound!', firstLine: 'Hark the glad sound! the Saviour comes', verses: 4, seasons: ['Advent'], congregations: [], tunes: [{ id: 'bristol', name: 'Bristol', metre: 'CM' }], numbers: { neh: 5, am: 30 } },
  { id: 'on-jordans-bank', title: 'On Jordan’s bank the Baptist’s cry', firstLine: 'On Jordan’s bank the Baptist’s cry', verses: 5, seasons: ['Advent'], congregations: [], tunes: [{ id: 'winchester-new', name: 'Winchester New', metre: 'LM', midiFile: 'winchester-new.mid' }], numbers: { neh: 12, am: 36 } },
  // ---- Christmas ----
  { id: 'o-come-all-ye-faithful', title: 'O come, all ye faithful', firstLine: 'O come, all ye faithful', verses: 6, hasChorus: true, seasons: ['Christmas'], congregations: [], tunes: [{ id: 'adeste-fideles', name: 'Adeste Fideles', metre: 'Irregular', midiFile: 'adeste-fideles.mid', midiUrl: 'https://hymnary.org/tune/adeste_fideles_wade' }], numbers: { neh: 30, am: 78, mp: 487 } },
  { id: 'hark-the-herald', title: 'Hark! the herald-angels sing', firstLine: 'Hark! the herald-angels sing', verses: 3, seasons: ['Christmas'], congregations: [], tunes: [{ id: 'mendelssohn', name: 'Mendelssohn', metre: '77.77 D with refrain', midiFile: 'mendelssohn.mid' }], numbers: { neh: 26, am: 80, mp: 211 } },
  { id: 'once-in-royal', title: 'Once in royal David’s city', firstLine: 'Once in royal David’s city', verses: 6, seasons: ['Christmas'], congregations: ['all-age', 'family', 'traditional', 'cathedral'], tunes: [{ id: 'irby', name: 'Irby', metre: '87.87.77' }], numbers: { neh: 34, am: 84 } },
  { id: 'o-little-town', title: 'O little town of Bethlehem', firstLine: 'O little town of Bethlehem', verses: 4, seasons: ['Christmas'], congregations: [], tunes: [{ id: 'forest-green', name: 'Forest Green', metre: 'DCM' }, { id: 'st-louis', name: 'St Louis (Redner)', metre: '86.86.76.86', midiFile: 'st-louis.mid' }], numbers: { neh: 32, am: 86 } },
  { id: 'silent-night', title: 'Silent night', firstLine: 'Silent night, holy night', verses: 3, seasons: ['Christmas'], congregations: [], tunes: [{ id: 'stille-nacht', name: 'Stille Nacht', metre: 'Irregular', midiFile: 'stille-nacht.mid' }], numbers: { am: 87, mp: 602 } },
  { id: 'in-the-bleak-midwinter', title: 'In the bleak mid-winter', firstLine: 'In the bleak mid-winter', verses: 4, seasons: ['Christmas'], congregations: [], tunes: [{ id: 'cranham', name: 'Cranham (Holst)', metre: 'Irregular', midiFile: 'cranham.mid' }, { id: 'darke', name: 'Darke' }], numbers: { neh: 28 } },
  { id: 'joy-to-the-world', title: 'Joy to the world', firstLine: 'Joy to the world! the Lord is come', verses: 4, seasons: ['Christmas'], congregations: ['contemporary', 'all-age', 'family'], tunes: [{ id: 'antioch', name: 'Antioch', metre: 'CM', midiFile: 'antioch.mid' }], numbers: { mp: 393 } },
  // ---- Epiphany ----
  { id: 'as-with-gladness', title: 'As with gladness men of old', firstLine: 'As with gladness men of old', verses: 5, seasons: ['Epiphany'], congregations: [], tunes: [{ id: 'dix', name: 'Dix', metre: '77.77.77', midiFile: 'dix.mid' }], numbers: { neh: 47, am: 98 } },
  { id: 'brightest-and-best', title: 'Brightest and best of the sons of the morning', firstLine: 'Brightest and best of the sons of the morning', verses: 5, seasons: ['Epiphany'], congregations: [], tunes: [{ id: 'epiphany-hymn', name: 'Epiphany', metre: '11.10.11.10' }], numbers: { neh: 49 } },
  { id: 'songs-of-thankfulness', title: 'Songs of thankfulness and praise', firstLine: 'Songs of thankfulness and praise', verses: 4, seasons: ['Epiphany'], congregations: ['traditional', 'cathedral'], tunes: [{ id: 'st-edmund', name: 'St Edmund', metre: '77.77 D' }, { id: 'st-george-windsor-stp', name: 'St George’s Windsor', metre: '77.77 D', midiFile: 'st-george-windsor.mid' }], numbers: { neh: 56 } },
  // ---- Lent ----
  { id: 'forty-days', title: 'Forty days and forty nights', firstLine: 'Forty days and forty nights', verses: 5, seasons: ['Lent'], congregations: [], tunes: [{ id: 'aus-der-tiefe', name: 'Aus der Tiefe (Heinlein)', metre: '77.77' }], numbers: { neh: 67, am: 119 } },
  { id: 'lord-jesus-think-on-me', title: 'Lord Jesus, think on me', firstLine: 'Lord Jesus, think on me', verses: 4, seasons: ['Lent'], congregations: [], tunes: [{ id: 'southwell', name: 'Southwell', metre: 'SM', midiFile: 'southwell.mid' }], numbers: { neh: 70 } },
  { id: 'be-thou-my-guardian', title: 'Be thou my guardian and my guide', firstLine: 'Be thou my guardian and my guide', verses: 4, seasons: ['Lent'], congregations: ['traditional', 'small-rural'], tunes: [{ id: 'abridge', name: 'Abridge', metre: 'CM' }], numbers: { neh: 64 } },
  // ---- Passiontide ----
  { id: 'when-i-survey', title: 'When I survey the wondrous cross', firstLine: 'When I survey the wondrous cross', verses: 4, seasons: ['Passiontide', 'Lent'], congregations: [], tunes: [{ id: 'rockingham', name: 'Rockingham', metre: 'LM', midiFile: 'rockingham.mid', midiUrl: 'https://hymnary.org/tune/rockingham_miller' }], numbers: { neh: 95, am: 157, mp: 755 } },
  { id: 'there-is-a-green-hill', title: 'There is a green hill far away', firstLine: 'There is a green hill far away', verses: 5, seasons: ['Passiontide'], congregations: ['all-age', 'family', 'traditional'], tunes: [{ id: 'horsley', name: 'Horsley', metre: 'CM' }], numbers: { neh: 92, am: 155, mp: 674 } },
  { id: 'my-song-is-love-unknown', title: 'My song is love unknown', firstLine: 'My song is love unknown', verses: 7, seasons: ['Passiontide'], congregations: [], tunes: [{ id: 'love-unknown', name: 'Love Unknown (Ireland)', metre: '66.66.44.44' }], numbers: { neh: 86, am: 147 } },
  { id: 'ride-on-ride-on', title: 'Ride on, ride on in majesty', firstLine: 'Ride on! ride on in majesty!', verses: 5, seasons: ['Passiontide'], congregations: [], tunes: [{ id: 'winchester-new-rideon', name: 'Winchester New', metre: 'LM', midiFile: 'winchester-new.mid' }], numbers: { neh: 511, am: 161 } },
  { id: 'o-sacred-head', title: 'O sacred head, sore wounded', firstLine: 'O sacred head, sore wounded', verses: 4, seasons: ['Passiontide'], congregations: ['traditional', 'cathedral'], tunes: [{ id: 'passion-chorale', name: 'Passion Chorale', metre: '76.76 D', midiFile: 'passion-chorale.mid' }], numbers: { neh: 90, am: 152 } },
  // ---- Easter ----
  { id: 'jesus-christ-is-risen-today', title: 'Jesus Christ is risen today', firstLine: 'Jesus Christ is risen today, Alleluia!', verses: 4, seasons: ['Easter'], congregations: [], tunes: [{ id: 'easter-hymn', name: 'Easter Hymn', metre: '77.77 with Alleluias', midiFile: 'easter-hymn.mid', midiUrl: 'https://hymnary.org/tune/easter_hymn' }], numbers: { neh: 110, am: 169, mp: 357 } },
  { id: 'thine-be-the-glory', title: 'Thine be the glory', firstLine: 'Thine be the glory, risen, conquering Son', verses: 3, hasChorus: true, seasons: ['Easter'], congregations: [], tunes: [{ id: 'maccabaeus', name: 'Maccabaeus', metre: '10.11.11.11', midiUrl: 'https://hymnary.org/tune/maccabaeus_handel' }], numbers: { neh: 120, am: 218, mp: 689 } },
  { id: 'now-the-green-blade', title: 'Now the green blade riseth', firstLine: 'Now the green blade riseth from the buried grain', verses: 4, seasons: ['Easter'], congregations: [], tunes: [{ id: 'noel-nouvelet', name: 'Noël Nouvelet', metre: '11.10.10.11' }], numbers: { neh: 115 } },
  { id: 'the-day-of-resurrection', title: 'The day of resurrection', firstLine: 'The day of resurrection! Earth, tell it out abroad', verses: 3, seasons: ['Easter'], congregations: ['traditional', 'cathedral'], tunes: [{ id: 'ellacombe', name: 'Ellacombe', metre: '76.76 D', midiFile: 'ellacombe.mid' }], numbers: { neh: 117, am: 208 } },
  // ---- Ascension ----
  { id: 'hail-the-day', title: 'Hail the day that sees him rise', firstLine: 'Hail the day that sees him rise, Alleluia!', verses: 5, seasons: ['Easter'], congregations: [], tunes: [{ id: 'llanfair', name: 'Llanfair', metre: '77.77 with Alleluias', midiFile: 'llanfair.mid' }], numbers: { neh: 130, am: 222 } },
  { id: 'crown-him', title: 'Crown him with many crowns', firstLine: 'Crown him with many crowns', verses: 5, seasons: ['Easter', 'Ordinary Time after Trinity'], congregations: [], tunes: [{ id: 'diademata', name: 'Diademata', metre: 'DSM', midiFile: 'diademata.mid', midiUrl: 'https://hymnary.org/tune/diademata_elvey' }], numbers: { neh: 352, am: 228, mp: 109 } },
  // ---- Pentecost ----
  { id: 'come-down-o-love-divine', title: 'Come down, O Love divine', firstLine: 'Come down, O Love divine', verses: 4, seasons: ['Easter'], congregations: [], tunes: [{ id: 'down-ampney', name: 'Down Ampney (Vaughan Williams)', metre: '66.11 D' }], numbers: { neh: 137, am: 238 } },
  { id: 'breathe-on-me', title: 'Breathe on me, Breath of God', firstLine: 'Breathe on me, Breath of God', verses: 4, seasons: ['Easter'], congregations: [], tunes: [{ id: 'carlisle', name: 'Carlisle', metre: 'SM' }], numbers: { neh: 342, am: 236, mp: 67 } },
  { id: 'come-holy-ghost', title: 'Come, Holy Ghost, our souls inspire', firstLine: 'Come, Holy Ghost, our souls inspire', verses: 4, seasons: ['Easter'], congregations: ['traditional', 'cathedral'], tunes: [{ id: 'veni-creator', name: 'Veni Creator (plainsong)', metre: 'LM' }], numbers: { neh: 138, am: 234 } },
  // ---- Trinity ----
  { id: 'holy-holy-holy', title: 'Holy, holy, holy', firstLine: 'Holy, holy, holy! Lord God Almighty', verses: 4, seasons: ['Ordinary Time after Trinity'], congregations: [], tunes: [{ id: 'nicaea', name: 'Nicaea', metre: '11.12.12.10', midiFile: 'nicaea.mid', midiUrl: 'https://hymnary.org/tune/nicaea_dykes' }], numbers: { neh: 146, am: 245, cp: 187 } },
  // ---- Ascension & sacrament ----
  { id: 'alleluia-sing-to-jesus', title: 'Alleluia, sing to Jesus', firstLine: 'Alleluia, sing to Jesus, his the sceptre, his the throne', verses: 4, seasons: ['Easter'], congregations: [], tunes: [{ id: 'hyfrydol', name: 'Hyfrydol', metre: '87.87 D', midiFile: 'hyfrydol.mid' }], numbers: { neh: 271 } },
  { id: 'let-all-mortal-flesh', title: 'Let all mortal flesh keep silence', firstLine: 'Let all mortal flesh keep silence', verses: 4, seasons: ['Advent'], congregations: ['traditional', 'cathedral'], tunes: [{ id: 'picardy', name: 'Picardy', metre: '87.87.87', midiFile: 'picardy.mid' }], numbers: { neh: 295 } },
  // ---- Harvest ----
  { id: 'we-plough-the-fields', title: 'We plough the fields, and scatter', firstLine: 'We plough the fields, and scatter', verses: 3, hasChorus: true, seasons: ['Ordinary Time after Trinity'], congregations: ['all-age', 'family', 'small-rural'], tunes: [{ id: 'wir-pfluegen', name: 'Wir pflügen', metre: '76.76 D with refrain' }], numbers: { neh: 290, mp: 732 } },
  { id: 'come-ye-thankful-people', title: 'Come, ye thankful people, come', firstLine: 'Come, ye thankful people, come', verses: 4, seasons: ['Ordinary Time after Trinity'], congregations: [], tunes: [{ id: 'st-george-windsor', name: 'St George’s Windsor', metre: '77.77 D', midiFile: 'st-george-windsor.mid' }], numbers: { neh: 289 } },
  // ---- General praise ----
  { id: 'o-god-our-help', title: 'O God, our help in ages past', firstLine: 'O God, our help in ages past', verses: 6, seasons: [], congregations: [], tunes: [{ id: 'st-anne', name: 'St Anne', metre: 'CM', midiFile: 'st-anne.mid' }], numbers: { neh: 417 } },
  { id: 'the-churchs-one-foundation', title: 'The Church’s one foundation', firstLine: 'The Church’s one foundation is Jesus Christ her Lord', verses: 5, seasons: [], congregations: [], tunes: [{ id: 'aurelia', name: 'Aurelia', metre: '76.76 D', midiFile: 'aurelia.mid' }], numbers: { neh: 484 } },
  { id: 'amazing-grace', title: 'Amazing grace', firstLine: 'Amazing grace! how sweet the sound', verses: 6, seasons: [], congregations: [], tunes: [{ id: 'new-britain', name: 'New Britain (Amazing Grace)', metre: 'CM', midiFile: 'new-britain.mid' }], numbers: { mp: 31 } },
  { id: 'glorious-things', title: 'Glorious things of thee are spoken', firstLine: 'Glorious things of thee are spoken', verses: 3, seasons: [], congregations: [], tunes: [{ id: 'austria', name: 'Austria (Austrian Hymn)', metre: '87.87 D', midiFile: 'austria.mid' }], numbers: { neh: 362 } },
  { id: 'praise-to-the-lord', title: 'Praise to the Lord, the Almighty', firstLine: 'Praise to the Lord, the Almighty, the King of creation', verses: 4, seasons: [], congregations: [], tunes: [{ id: 'lobe-den-herren', name: 'Lobe den Herren', metre: '14.14.4.7.8', midiFile: 'lobe-den-herren.mid', midiUrl: 'https://hymnary.org/tune/lobe_den_herren' }], numbers: { neh: 440, mp: 564 } },
  { id: 'praise-my-soul', title: 'Praise, my soul, the King of heaven', firstLine: 'Praise, my soul, the King of heaven', verses: 4, seasons: [], congregations: [], tunes: [{ id: 'lauda-anima', name: 'Lauda Anima (Goss)', metre: '87.87.87', midiFile: 'lauda-anima.mid' }], numbers: { neh: 436, mp: 560 } },
  { id: 'love-divine', title: 'Love divine, all loves excelling', firstLine: 'Love divine, all loves excelling', verses: 3, seasons: [], congregations: [], tunes: [{ id: 'blaenwern', name: 'Blaenwern', metre: '87.87 D' }, { id: 'love-divine-stainer', name: 'Love Divine (Stainer)', metre: '87.87' }, { id: 'hyfrydol-love-divine', name: 'Hyfrydol', metre: '87.87 D', midiFile: 'hyfrydol.mid' }], numbers: { neh: 408, mp: 449 } },
  { id: 'dear-lord-and-father', title: 'Dear Lord and Father of mankind', firstLine: 'Dear Lord and Father of mankind', verses: 5, seasons: [], congregations: [], tunes: [{ id: 'repton', name: 'Repton (Parry)', metre: '86.886' }], numbers: { neh: 353, mp: 111 } },
  { id: 'the-king-of-love', title: 'The King of love my shepherd is', firstLine: 'The King of love my shepherd is', verses: 6, seasons: [], congregations: [], tunes: [{ id: 'dominus-regit-me', name: 'Dominus regit me', metre: '87.87' }, { id: 'st-columba', name: 'St Columba', metre: '87.87' }], numbers: { neh: 457, mp: 649 } },
  { id: 'guide-me', title: 'Guide me, O thou great Redeemer', firstLine: 'Guide me, O thou great Redeemer', verses: 3, seasons: [], congregations: [], tunes: [{ id: 'cwm-rhondda', name: 'Cwm Rhondda', metre: '87.87.47', midiFile: 'cwm-rhondda.mid', midiUrl: 'https://hymnary.org/tune/cwm_rhondda' }], numbers: { neh: 368, mp: 201 } },
  { id: 'immortal-invisible', title: 'Immortal, invisible, God only wise', firstLine: 'Immortal, invisible, God only wise', verses: 4, seasons: [], congregations: [], tunes: [{ id: 'st-denio', name: 'St Denio', metre: '11.11.11.11', midiFile: 'st-denio.mid' }], numbers: { neh: 377, mp: 327 } },
  { id: 'all-people-that-on-earth', title: 'All people that on earth do dwell', firstLine: 'All people that on earth do dwell', verses: 5, seasons: [], congregations: ['traditional', 'cathedral', 'small-rural'], tunes: [{ id: 'old-hundredth', name: 'Old Hundredth', metre: 'LM', midiFile: 'old-hundredth.mid', midiUrl: 'https://hymnary.org/tune/old_hundredth' }], numbers: { neh: 334, mp: 20 } },
  { id: 'be-thou-my-vision', title: 'Be thou my vision', firstLine: 'Be thou my vision, O Lord of my heart', verses: 5, seasons: [], congregations: [], tunes: [{ id: 'slane', name: 'Slane', metre: '10.10.10.10', midiFile: 'slane.mid' }], numbers: { neh: 339, mp: 58 } },
  { id: 'tell-out-my-soul', title: 'Tell out, my soul', firstLine: 'Tell out, my soul, the greatness of the Lord', verses: 4, seasons: [], congregations: [], tunes: [{ id: 'woodlands', name: 'Woodlands', metre: '10.10.10.10' }], numbers: { neh: 186, mp: 631 } },
  { id: 'lord-of-all-hopefulness', title: 'Lord of all hopefulness', firstLine: 'Lord of all hopefulness, Lord of all joy', verses: 4, seasons: [], congregations: [], tunes: [{ id: 'slane-hopefulness', name: 'Slane', metre: '10.11.11.12', midiFile: 'slane.mid' }], numbers: { neh: 239, mp: 442 } },
  { id: 'all-my-hope', title: 'All my hope on God is founded', firstLine: 'All my hope on God is founded', verses: 5, seasons: [], congregations: [], tunes: [{ id: 'michael', name: 'Michael (Howells)', metre: '87.87.337' }], numbers: { neh: 333, mp: 16 } },
  { id: 'now-thank-we-all', title: 'Now thank we all our God', firstLine: 'Now thank we all our God', verses: 3, seasons: [], congregations: [], tunes: [{ id: 'nun-danket', name: 'Nun danket', metre: '67.67.66.66', midiFile: 'nun-danket.mid' }], numbers: { neh: 413, mp: 486 } },
  { id: 'great-is-thy-faithfulness', title: 'Great is thy faithfulness', firstLine: 'Great is thy faithfulness, O God my Father', verses: 3, hasChorus: true, seasons: [], congregations: [], tunes: [{ id: 'faithfulness', name: 'Faithfulness', metre: '11.10.11.10', midiUrl: 'https://hymnary.org/tune/faithfulness_runyan' }], numbers: { mp: 200, hon: 181 } },
  // ---- Evening ----
  { id: 'abide-with-me', title: 'Abide with me', firstLine: 'Abide with me; fast falls the eventide', verses: 5, seasons: [], congregations: [], tunes: [{ id: 'eventide', name: 'Eventide (Monk)', metre: '10.10.10.10', midiFile: 'eventide.mid', midiUrl: 'https://hymnary.org/tune/eventide_monk' }], numbers: { neh: 331, mp: 4 } },
  { id: 'the-day-thou-gavest', title: 'The day thou gavest, Lord, is ended', firstLine: 'The day thou gavest, Lord, is ended', verses: 5, seasons: [], congregations: [], tunes: [{ id: 'st-clement', name: 'St Clement', metre: '98.98' }], numbers: { neh: 252, mp: 645 } },
  // ---- Contemporary & all-age ----
  { id: 'shine-jesus-shine', title: 'Shine, Jesus, shine', firstLine: 'Lord, the light of your love is shining', verses: 3, hasChorus: true, seasons: [], congregations: ['contemporary', 'all-age', 'family'], tunes: [{ id: 'shine-jesus-shine', name: 'Shine Jesus Shine (Kendrick)' }], numbers: { mp: 445, ssp: 200 } },
  { id: 'be-still', title: 'Be still, for the presence of the Lord', firstLine: 'Be still, for the presence of the Lord', verses: 3, seasons: [], congregations: ['contemporary', 'all-age'], tunes: [{ id: 'be-still', name: 'Be Still (Evans)' }], numbers: { mp: 50 } },
  { id: 'in-christ-alone', title: 'In Christ alone', firstLine: 'In Christ alone my hope is found', verses: 4, seasons: [], congregations: ['contemporary', 'all-age'], tunes: [{ id: 'in-christ-alone', name: 'In Christ Alone (Getty/Townend)' }], numbers: {} },
  { id: 'ten-thousand-reasons', title: '10,000 Reasons (Bless the Lord)', firstLine: 'Bless the Lord, O my soul', verses: 3, hasChorus: true, seasons: [], congregations: ['contemporary', 'family'], tunes: [{ id: 'ten-thousand-reasons', name: '10,000 Reasons (Redman)' }], numbers: {} },
  { id: 'here-i-am-lord', title: 'I, the Lord of sea and sky (Here I am, Lord)', firstLine: 'I, the Lord of sea and sky', verses: 3, hasChorus: true, seasons: [], congregations: ['contemporary', 'all-age', 'family'], tunes: [{ id: 'here-i-am', name: 'Here I Am, Lord (Schutte)' }], numbers: { hon: 235 } },
  { id: 'make-me-a-channel', title: 'Make me a channel of your peace', firstLine: 'Make me a channel of your peace', verses: 3, seasons: [], congregations: ['all-age', 'family', 'contemporary'], tunes: [{ id: 'channel-of-peace', name: 'Channel of Peace (Temple)' }], numbers: { mp: 456, hon: 328 } },
  { id: 'all-things-bright', title: 'All things bright and beautiful', firstLine: 'All things bright and beautiful', verses: 4, hasChorus: true, seasons: [], congregations: ['all-age', 'family', 'small-rural'], tunes: [{ id: 'royal-oak', name: 'Royal Oak', metre: '76.76 with refrain' }, { id: 'all-things-bright', name: 'All Things Bright (Monk)' }], numbers: { neh: 264, mp: 23 } },
  { id: 'morning-has-broken', title: 'Morning has broken', firstLine: 'Morning has broken like the first morning', verses: 3, seasons: [], congregations: ['all-age', 'family'], tunes: [{ id: 'bunessan', name: 'Bunessan', metre: '55.54 D' }], numbers: { mp: 467, hon: 341 } },
];

export function getHymn(id: string): Hymn | undefined {
  return HYMNS.find((h) => h.id === id);
}

export function getHymnBook(id: string): HymnBook | undefined {
  return HYMN_BOOKS.find((b) => b.id === id);
}

/**
 * Suggest hymns for the day, scored by season and congregation match, and by
 * whether we can point to a number in one of the user's books. Hymns whose
 * numbers aren't indexed still appear (most are in every major book — check
 * the book's own index), just ranked lower.
 */
export function suggestHymns(
  season: Season,
  congregation: CongregationType | null,
  ownedBookIds: string[],
): Hymn[] {
  const owned = new Set(ownedBookIds);
  const score = (h: Hymn): number => {
    let s = 0;
    if (h.seasons.includes(season)) s += 3;
    if (h.seasons.length === 0) s += 1; // all-season hymns are mildly suitable
    if (congregation && h.congregations.includes(congregation)) s += 2;
    if (h.congregations.length === 0) s += 1;
    if (ownedBookIds.length > 0 && Object.keys(h.numbers).some((b) => owned.has(b))) s += 2;
    return s;
  };
  return [...HYMNS].sort((a, b) => score(b) - score(a));
}
