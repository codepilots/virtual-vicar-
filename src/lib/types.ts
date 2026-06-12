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
  notes?: string;
}

/** The persisted user settings (Settings screen). */
export interface Settings {
  bibleVersionId: string;
  ownedHymnBookIds: string[];
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
  hymns: HymnChoice[];
  address: AddressChoice;
}

export const DEFAULT_SETTINGS: Settings = {
  bibleVersionId: 'nrsva',
  ownedHymnBookIds: ['neh', 'am'],
  congregation: null,
  useOnlineSources: true,
  ttsEnabled: true,
  ttsVoice: null,
  ttsRate: 0.95,
  runTextScale: 1,
};
