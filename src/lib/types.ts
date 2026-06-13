// Shared types describing a fully-configured service ready to run.

export interface HymnChoice {
  /** The service section this hymn fills (e.g. "opening-hymn"). */
  sectionId: string;
  hymnId: string;
  tuneId: string;
  /** Number of verses to sing. */
  verses: number;
  /** Whether to sing the chorus/refrain. */
  includeChorus: boolean;
  /**
   * Order of items, e.g. ['v1','chorus','v2','chorus']. Lets the user lay out
   * verses and choruses exactly as they want them.
   */
  order: string[];
  /** Play the MIDI during the run, or leave silent. */
  playMidi: boolean;
}

export interface AddressChoice {
  /** A chosen resource id, or null if the leader will prepare their own. */
  resourceId: string | null;
  /** A specific post/episode picked from the resource's feed, if any. */
  itemTitle?: string;
  itemUrl?: string;
  notes?: string;
}

/** The persisted user settings (Settings screen). */
export interface Settings {
  bibleVersionId: string;
  ownedHymnBookIds: string[];
  /**
   * Only suggest hymns where at least one tune has a MIDI bundled with the
   * app — i.e. the tune can always be played, even offline.
   */
  onlyBundledMidi: boolean;
  congregation: import('../data/congregation').CongregationType | null;
  /**
   * Fetch from online sources (LectServe lectionary, bible-api.com passage
   * text, Hymnary suggestions). Off = fully offline, link-outs only.
   */
  useOnlineSources: boolean;
  /** Use TTS to read officiant parts aloud in run mode. */
  ttsEnabled: boolean;
  /** Preferred TTS voice name, if any. */
  ttsVoice: string | null;
  ttsRate: number;
  /** Run-mode reading text scale (1 = default), for legibility. */
  runTextScale: number;
}

/** Everything chosen in the setup wizard for one service occasion. */
export interface ServicePlan {
  serviceId: string;
  /** ISO date string (yyyy-mm-dd) of the occasion. */
  dateIso: string;
  /** Section id -> included?  (only meaningful for optional sections). */
  includedSections: Record<string, boolean>;
  /**
   * Section id -> text the user pasted from an official source (e.g. the
   * C of E website), so placeholdered or link-out sections can be shown,
   * printed and read aloud offline. Stored locally with the plan only; the
   * user is responsible for holding the right to reproduce what they paste.
   */
  customTexts?: Record<string, string>;
  hymns: HymnChoice[];
  address: AddressChoice;
  /**
   * Intercession choices for the Prayers slot, set in the wizard. When absent,
   * run mode falls back to offering every prepared form (the original
   * behaviour). `preparedIds` is the explicit set of prepared forms to include
   * (an empty array means "none — I'll pray freely").
   */
  intercessions?: {
    preparedIds: string[];
  };
  /**
   * For sections whose pasted text offers "or" alternatives, the chosen option
   * per group: `alternatives[sectionId][groupIndex]` is the option index, or
   * < 0 / missing to keep all of that group (decide on the day).
   */
  alternatives?: Record<string, number[]>;
}

export const DEFAULT_SETTINGS: Settings = {
  bibleVersionId: 'nrsva',
  ownedHymnBookIds: ['neh', 'am'],
  onlyBundledMidi: false,
  congregation: null,
  useOnlineSources: true,
  ttsEnabled: true,
  ttsVoice: null,
  ttsRate: 0.95,
  runTextScale: 1,
};
