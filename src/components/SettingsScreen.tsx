import { useEffect, useState } from 'react';
import type { Settings } from '../lib/types';
import { BIBLE_VERSIONS } from '../data/bibleVersions';
import { HYMN_BOOKS } from '../data/hymns';
import { CONGREGATION_TYPES, type CongregationType } from '../data/congregation';
import { loadVoices, ttsSupported } from '../lib/tts';

interface Props {
  settings: Settings;
  onChange: (s: Settings) => void;
}

export function SettingsScreen({ settings, onChange }: Props) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    loadVoices().then(setVoices);
  }, []);

  const set = (patch: Partial<Settings>) => onChange({ ...settings, ...patch });

  const toggleBook = (id: string) => {
    const owned = new Set(settings.ownedHymnBookIds);
    if (owned.has(id)) owned.delete(id);
    else owned.add(id);
    set({ ownedHymnBookIds: [...owned] });
  };

  return (
    <div>
      <div className="card">
        <h3>Bible version</h3>
        <p className="subtle">Readings will link to this version, opened to the right passage.</p>
        <div className="field">
          <select
            value={settings.bibleVersionId}
            onChange={(e) => set({ bibleVersionId: e.target.value })}
          >
            {BIBLE_VERSIONS.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.code}){v.recommended ? ' ★' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <h3>Hymn books you have</h3>
        <p className="subtle">
          I’ll only suggest hymns you can actually find, with the number in your books.
        </p>
        <div>
          {HYMN_BOOKS.map((b) => (
            <button
              key={b.id}
              className={`chip ${settings.ownedHymnBookIds.includes(b.id) ? 'on' : ''}`}
              onClick={() => toggleBook(b.id)}
            >
              {b.abbreviation} · {b.name}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Congregation</h3>
        <p className="subtle">Tailors hymn and address suggestions to your context.</p>
        <div className="field">
          <select
            value={settings.congregation ?? ''}
            onChange={(e) =>
              set({ congregation: (e.target.value || null) as CongregationType | null })
            }
          >
            <option value="">Any / not set</option>
            {CONGREGATION_TYPES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label} — {c.description}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <h3>Spoken voice (text-to-speech)</h3>
        {!ttsSupported() && (
          <p className="subtle">This browser doesn’t support speech; the guide will be text-only.</p>
        )}
        <label className="switch">
          <span className="sw-text">
            <span className="t">Read officiant parts aloud</span>
            <span className="d">Let the app take the vicar’s voice in run mode.</span>
          </span>
          <input
            type="checkbox"
            className="toggle"
            checked={settings.ttsEnabled}
            onChange={(e) => set({ ttsEnabled: e.target.checked })}
          />
        </label>
        {settings.ttsEnabled && (
          <>
            <div className="field" style={{ marginTop: 12 }}>
              <label>Voice</label>
              <select
                value={settings.ttsVoice ?? ''}
                onChange={(e) => set({ ttsVoice: e.target.value || null })}
              >
                <option value="">Default voice</option>
                {voices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Speaking pace: {settings.ttsRate.toFixed(2)}×</label>
              <input
                type="range"
                min={0.6}
                max={1.3}
                step={0.05}
                value={settings.ttsRate}
                onChange={(e) => set({ ttsRate: Number(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
