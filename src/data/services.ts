// Service definitions — only offices a lay person may lawfully lead in the
// Church of England (no Eucharist / Holy Communion, which requires a priest).
//
// Each service is an ordered list of sections. Sections are flagged as optional
// so the user can include or omit them when configuring, and `role` drives the
// step-by-step run mode and the text-to-speech "vicar voice".

import { BCP_SERVICES } from './bcp';

export type SectionKind =
  | 'rubric' // an instruction, not spoken aloud
  | 'said' // spoken text (officiant and/or all)
  | 'responsive' // versicle / response
  | 'reading' // a scripture reading slot (filled from the lectionary)
  | 'psalm' // a psalm slot
  | 'hymn' // a hymn slot (filled from the hymn picker)
  | 'sermon' // the address / talk slot
  | 'prayers' // intercessions
  | 'collect'; // the collect of the day

export type Role = 'officiant' | 'all' | 'reader' | 'none';

export interface ServiceSection {
  id: string;
  title: string;
  kind: SectionKind;
  role: Role;
  /**
   * Whether the user may omit this section when configuring. Optional
   * sections start OFF in a fresh plan; the user's last selections for the
   * service are remembered and used as the starting point next time.
   */
  optional: boolean;
  /** Spoken/printed text where the section has fixed words. */
  text?: string;
  /** Short helper note shown to the user. */
  note?: string;
  /**
   * True when `text` is a hand-transcription that has not yet been proofread
   * against a printed copy — surfaced as a warning in the UI.
   */
  unverified?: boolean;
}

export interface ServiceDefinition {
  id: string;
  name: string;
  tradition: 'Common Worship' | 'Book of Common Prayer';
  /** One-line description for the chooser. */
  summary: string;
  /** Confirmation that a lay person may lead this service. */
  layLed: true;
  /** Rough time of day the office is intended for. */
  timeOfDay: 'morning' | 'evening' | 'night' | 'any';
  sections: ServiceSection[];
}

// SCAFFOLD: section text is left as short placeholders / link-outs. The shape
// is complete so the wizard and run mode work end to end; drop in the
// authorised liturgy text per section as needed.
function placeholder(title: string): string {
  return `[${title} — insert authorised text.]`;
}

/**
 * True when a section's `text` is one of the scaffold placeholders above —
 * i.e. the real (licensed) wording is not bundled and the user may paste it
 * in themselves via the wizard.
 */
export function isPlaceholderText(text: string | undefined): boolean {
  return Boolean(text && /^\[.*insert authorised text\.?\]$/s.test(text.trim()));
}

const morningPrayer: ServiceDefinition = {
  id: 'morning-prayer-cw',
  name: 'Morning Prayer',
  tradition: 'Common Worship',
  summary: 'The daily office of Morning Prayer — may be led by a lay person.',
  layLed: true,
  timeOfDay: 'morning',
  sections: [
    { id: 'preparation', title: 'Preparation', kind: 'said', role: 'officiant', optional: false, text: placeholder('Opening sentence & preparation') },
    { id: 'opening-hymn', title: 'Opening Hymn', kind: 'hymn', role: 'all', optional: true },
    { id: 'confession', title: 'Confession', kind: 'said', role: 'all', optional: true, text: placeholder('Confession') },
    { id: 'absolution', title: 'Absolution', kind: 'said', role: 'officiant', optional: true, note: 'A lay person uses the form “us/our”, not “you/your”.', text: placeholder('Absolution (form for lay leader)') },
    { id: 'preces', title: 'Opening Versicles', kind: 'responsive', role: 'officiant', optional: false, text: placeholder('O Lord, open our lips…') },
    { id: 'venite', title: 'Venite / Opening Canticle', kind: 'psalm', role: 'all', optional: true },
    { id: 'psalmody', title: 'Psalmody', kind: 'psalm', role: 'all', optional: false, note: 'From the lectionary for the day.' },
    { id: 'canticle', title: 'Canticle', kind: 'said', role: 'all', optional: true, text: placeholder('Canticle') },
    { id: 'first-reading', title: 'Scripture Reading', kind: 'reading', role: 'reader', optional: false },
    { id: 'second-reading', title: 'Second Reading', kind: 'reading', role: 'reader', optional: true },
    { id: 'gospel-canticle', title: 'Gospel Canticle (Benedictus)', kind: 'said', role: 'all', optional: true, text: placeholder('Gospel Canticle') },
    { id: 'sermon', title: 'Sermon / Address', kind: 'sermon', role: 'officiant', optional: true, note: 'Optional reflection or address.' },
    { id: 'creed', title: 'The Apostles’ Creed', kind: 'said', role: 'all', optional: true, text: placeholder('Apostles’ Creed') },
    { id: 'prayers', title: 'Prayers / Intercessions', kind: 'prayers', role: 'officiant', optional: false },
    { id: 'collect', title: 'The Collect of the Day', kind: 'collect', role: 'officiant', optional: false },
    { id: 'lords-prayer', title: 'The Lord’s Prayer', kind: 'said', role: 'all', optional: false, text: placeholder('The Lord’s Prayer') },
    { id: 'mid-hymn', title: 'Hymn', kind: 'hymn', role: 'all', optional: true },
    { id: 'conclusion', title: 'The Conclusion', kind: 'said', role: 'officiant', optional: false, text: placeholder('Concluding sentence & grace') },
    { id: 'closing-hymn', title: 'Closing Hymn', kind: 'hymn', role: 'all', optional: true },
  ],
};

const eveningPrayer: ServiceDefinition = {
  ...morningPrayer,
  id: 'evening-prayer-cw',
  name: 'Evening Prayer',
  summary: 'The daily office of Evening Prayer — may be led by a lay person.',
  timeOfDay: 'evening',
  sections: morningPrayer.sections.map((s) =>
    s.id === 'gospel-canticle' ? { ...s, title: 'Gospel Canticle (Magnificat)' } : s,
  ),
};

const nightPrayer: ServiceDefinition = {
  id: 'night-prayer-cw',
  name: 'Night Prayer (Compline)',
  tradition: 'Common Worship',
  summary: 'A short, reflective office to end the day — well suited to lay leading.',
  layLed: true,
  timeOfDay: 'night',
  sections: [
    { id: 'preparation', title: 'Preparation', kind: 'said', role: 'officiant', optional: false, text: placeholder('The Lord almighty grant us a quiet night…') },
    { id: 'confession', title: 'Confession', kind: 'said', role: 'all', optional: true, text: placeholder('Confession') },
    { id: 'hymn', title: 'Hymn', kind: 'hymn', role: 'all', optional: true },
    { id: 'psalmody', title: 'Psalmody', kind: 'psalm', role: 'all', optional: false },
    { id: 'reading', title: 'Short Reading', kind: 'reading', role: 'reader', optional: false },
    { id: 'responsory', title: 'Responsory', kind: 'responsive', role: 'officiant', optional: true, text: placeholder('Into your hands, O Lord…') },
    { id: 'nunc-dimittis', title: 'Nunc Dimittis', kind: 'said', role: 'all', optional: true, text: placeholder('Nunc Dimittis') },
    { id: 'prayers', title: 'Prayers', kind: 'prayers', role: 'officiant', optional: false },
    { id: 'collect', title: 'The Collect', kind: 'collect', role: 'officiant', optional: false },
    { id: 'lords-prayer', title: 'The Lord’s Prayer', kind: 'said', role: 'all', optional: true, text: placeholder('The Lord’s Prayer') },
    { id: 'conclusion', title: 'The Conclusion', kind: 'said', role: 'officiant', optional: false, text: placeholder('Concluding blessing') },
  ],
};

const serviceOfTheWord: ServiceDefinition = {
  id: 'service-of-the-word-cw',
  name: 'A Service of the Word',
  tradition: 'Common Worship',
  summary: 'A flexible, all-age framework — almost every element is optional.',
  layLed: true,
  timeOfDay: 'any',
  sections: [
    { id: 'greeting', title: 'Greeting', kind: 'responsive', role: 'officiant', optional: false, text: placeholder('The Lord be with you…') },
    { id: 'opening-hymn', title: 'Opening Hymn', kind: 'hymn', role: 'all', optional: true },
    { id: 'confession', title: 'Confession', kind: 'said', role: 'all', optional: true, text: placeholder('Confession') },
    { id: 'collect', title: 'The Collect', kind: 'collect', role: 'officiant', optional: true },
    { id: 'first-reading', title: 'Reading', kind: 'reading', role: 'reader', optional: false },
    { id: 'psalm', title: 'Psalm or Song', kind: 'psalm', role: 'all', optional: true },
    { id: 'gospel', title: 'Gospel Reading', kind: 'reading', role: 'reader', optional: true },
    { id: 'sermon', title: 'Sermon / Address', kind: 'sermon', role: 'officiant', optional: true },
    { id: 'creed', title: 'Affirmation of Faith', kind: 'said', role: 'all', optional: true, text: placeholder('Affirmation of Faith') },
    { id: 'mid-hymn', title: 'Hymn', kind: 'hymn', role: 'all', optional: true },
    { id: 'prayers', title: 'Prayers / Intercessions', kind: 'prayers', role: 'officiant', optional: false },
    { id: 'lords-prayer', title: 'The Lord’s Prayer', kind: 'said', role: 'all', optional: false, text: placeholder('The Lord’s Prayer') },
    { id: 'closing-hymn', title: 'Closing Hymn', kind: 'hymn', role: 'all', optional: true },
    { id: 'dismissal', title: 'The Dismissal', kind: 'said', role: 'officiant', optional: false, text: placeholder('Dismissal') },
  ],
};

export const SERVICES: ServiceDefinition[] = [
  morningPrayer,
  eveningPrayer,
  nightPrayer,
  serviceOfTheWord,
  ...BCP_SERVICES,
];

export function getService(id: string): ServiceDefinition | undefined {
  return SERVICES.find((s) => s.id === id);
}
