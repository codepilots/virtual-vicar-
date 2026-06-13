import { useEffect, useState } from 'react';
import { DEFAULT_SETTINGS, type Settings, type CustomAddressSource } from '../lib/types';
import { BIBLE_VERSIONS } from '../data/bibleVersions';
import { HYMN_BOOKS } from '../data/hymns';
import { CONGREGATION_TYPES, type CongregationType } from '../data/congregation';
import { ADDRESS_RESOURCES } from '../data/addressResources';
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

  // Reflection sources: show/hide the built-ins, add/remove your own.
  const [draft, setDraft] = useState<CustomAddressSource>({
    id: '',
    title: '',
    author: '',
    kind: 'blog',
    url: '',
    rssUrl: '',
  });
  const toggleSourceHidden = (id: string) => {
    const hidden = new Set(settings.hiddenSourceIds);
    if (hidden.has(id)) hidden.delete(id);
    else hidden.add(id);
    set({ hiddenSourceIds: [...hidden] });
  };
  const removeCustomSource = (id: string) =>
    set({ customSources: settings.customSources.filter((c) => c.id !== id) });
  const addCustomSource = () => {
    const title = draft.title.trim();
    const url = draft.url.trim();
    if (!title || !url) return;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const id = `custom-${slug || 'source'}-${settings.customSources.length + 1}`;
    set({
      customSources: [
        ...settings.customSources,
        { ...draft, id, title, url, author: draft.author.trim(), rssUrl: draft.rssUrl?.trim() || undefined },
      ],
    });
    setDraft({ id: '', title: '', author: '', kind: 'blog', url: '', rssUrl: '' });
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
                {v.name} ({v.code}){v.recommended ? ' ★' : ''}{v.apiId ? ' · text in app' : ''}
              </option>
            ))}
          </select>
        </div>
        <p className="subtle" style={{ fontSize: 13 }}>
          Versions marked “text in app” are public domain, so the passage itself can be shown
          (and read aloud) inside the app. Others open on an online Bible site.
        </p>
      </div>

      <div className="card">
        <h3>Online sources</h3>
        <label className="switch">
          <span className="sw-text">
            <span className="t">Look things up online</span>
            <span className="d">
              Lectionary readings (LectServe), passage text (bible-api.com) and hymn matches
              (Hymnary.org). Responses are cached, so prepare on wi-fi and the service still works
              with poor signal in church. Off = offline data and links only.
            </span>
          </span>
          <input
            type="checkbox"
            className="toggle"
            checked={settings.useOnlineSources}
            onChange={(e) => set({ useOnlineSources: e.target.checked })}
          />
        </label>
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
        <label className="switch" style={{ marginTop: 10 }}>
          <span className="sw-text">
            <span className="t">Only hymns with a bundled tune</span>
            <span className="d">
              Suggest only hymns whose tune MIDI ships with the app, so “Play the tune” always
              works — even offline. Public domain, credits in midi/CREDITS.md.
            </span>
          </span>
          <input
            type="checkbox"
            className="toggle"
            checked={settings.onlyBundledMidi}
            onChange={(e) => set({ onlyBundledMidi: e.target.checked })}
          />
        </label>
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
        <h3>The Reflection (sermon / address)</h3>
        <p className="subtle">
          In the Church of England, preaching is normally led by an authorised minister — a
          bishop, priest or deacon — or a licensed lay minister such as a Reader (LLM). A lay
          person without a licence may give a short <strong>reflection</strong> or address only
          with the permission of the incumbent (the parish priest), under the bishop’s direction
          (Canon&nbsp;B&nbsp;18). Turn this on only if you have that permission, and always check
          with your incumbent.
        </p>
        <label className="switch">
          <span className="sw-text">
            <span className="t">Offer a reflection slot</span>
            <span className="d">
              Adds a Reflection to the service (off by default). When off, it’s hidden from the
              wizard, the run-through and the printed sheet.
            </span>
          </span>
          <input
            type="checkbox"
            className="toggle"
            checked={settings.allowReflection}
            onChange={(e) => set({ allowReflection: e.target.checked })}
          />
        </label>
      </div>

      <div className="card">
        <h3>Reflection sources</h3>
        <p className="subtle">
          The blogs, podcasts and archives offered on the Reflection step. Untick to hide one, or
          add your own below.
        </p>
        {ADDRESS_RESOURCES.map((r) => (
          <label key={r.id} className="switch" style={{ alignItems: 'flex-start' }}>
            <span className="sw-text">
              <span className="t">{r.title}</span>
              <span className="d">
                {r.kind} · {r.author}
              </span>
            </span>
            <input
              type="checkbox"
              className="toggle"
              checked={!settings.hiddenSourceIds.includes(r.id)}
              onChange={() => toggleSourceHidden(r.id)}
            />
          </label>
        ))}
        {settings.customSources.map((c) => (
          <div key={c.id} className="title-row" style={{ padding: '6px 0' }}>
            <div>
              <strong>{c.title}</strong>
              <div className="subtle" style={{ fontSize: 12 }}>
                {c.kind} · {c.author || 'your source'} {c.rssUrl ? '· feed' : ''}
              </div>
            </div>
            <button className="btn ghost small" onClick={() => removeCustomSource(c.id)}>
              Remove
            </button>
          </div>
        ))}
        <details style={{ marginTop: 8 }}>
          <summary className="link" style={{ cursor: 'pointer' }}>
            + Add a source
          </summary>
          <div className="field" style={{ marginTop: 8 }}>
            <label>Title</label>
            <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Our parish blog" />
          </div>
          <div className="field">
            <label>Author / publisher (optional)</label>
            <input value={draft.author} onChange={(e) => setDraft({ ...draft, author: e.target.value })} />
          </div>
          <div className="field">
            <label>Kind</label>
            <select value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value as CustomAddressSource['kind'] })}>
              <option value="blog">Blog</option>
              <option value="podcast">Podcast</option>
              <option value="video">Video</option>
              <option value="sermon-archive">Sermon archive</option>
            </select>
          </div>
          <div className="field">
            <label>Website URL</label>
            <input value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="https://…" />
          </div>
          <div className="field">
            <label>RSS/feed URL (optional — enables in-app latest posts)</label>
            <input value={draft.rssUrl} onChange={(e) => setDraft({ ...draft, rssUrl: e.target.value })} placeholder="https://…/feed/" />
          </div>
          <button className="btn secondary small" onClick={addCustomSource} disabled={!draft.title.trim() || !draft.url.trim()}>
            Add source
          </button>
        </details>
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
        <div className="field" style={{ marginTop: 4 }}>
          <label>Reading text size in run mode: {Math.round((settings.runTextScale || 1) * 100)}%</label>
          <input
            type="range"
            min={0.85}
            max={1.8}
            step={0.05}
            value={settings.runTextScale || 1}
            onChange={(e) => set({ runTextScale: Number(e.target.value) })}
            style={{ width: '100%' }}
          />
          <div className="subtle" style={{ fontSize: 13 }}>
            Larger text for leading at arm’s length; adjustable on the fly during the service too.
          </div>
        </div>
      </div>

      <div className="card">
        <h3>About &amp; sources</h3>
        <ul className="credits">
          <li>
            <strong>BCP 1662 services, collects &amp; Coverdale Psalter</strong> — public domain.
            Hand-transcribed for this app and <em>not yet proofread</em>; unchecked texts are
            marked <span className="unverified">⚠</span> wherever they appear. Please verify
            against a printed Prayer Book before use.
          </li>
          <li>
            <strong>Common Worship</strong> texts — © The Archbishops’ Council. Not bundled; the
            app links to the official Church of England pages.
          </li>
          <li>
            <strong>Readings</strong> — Revised Common Lectionary via{' '}
            <a className="link" href="https://www.lectserve.com/" target="_blank" rel="noreferrer">
              LectServe
            </a>
            , with links to the official C of E lectionary.
          </li>
          <li>
            <strong>Bible text</strong> — public-domain translations via{' '}
            <a className="link" href="https://bible-api.com/" target="_blank" rel="noreferrer">
              bible-api.com
            </a>
            ; other versions link to BibleGateway.
          </li>
          <li>
            <strong>Bundled hymn-tune MIDIs</strong> — public domain, from{' '}
            <a className="link" href="https://openhymnal.org/" target="_blank" rel="noreferrer">
              The Open Hymnal Project
            </a>{' '}
            (ed. Brian J. Dumont), which verifies the copyright status of the music, setting,
            words and translation of every hymn it publishes. Per-tune composer and setting
            credits ship with the app in <code>midi/CREDITS.md</code>. Tunes whose usual
            settings are still in UK copyright (e.g. Vaughan Williams, Howells, Ireland) are
            deliberately not bundled.
          </li>
          <li>
            <strong>Hymn data &amp; other MIDI links</strong> —{' '}
            <a className="link" href="https://hymnary.org/" target="_blank" rel="noreferrer">
              Hymnary.org
            </a>
            ; in-app playback by html-midi-player.
          </li>
          <li>
            <strong>Blogs &amp; podcasts</strong> — content belongs to its publishers (Psephizo,
            Thinking Anglicans, ViaMedia.News, Covenant, Working Preacher, St Mellitus, Premier,
            Church Times…). Feeds are read directly or via public CORS passthroughs
            (corsproxy.io, AllOrigins, codetabs); feed addresses follow each publisher’s
            convention but are{' '}
            <span className="unverified">not yet individually verified</span> — a broken feed
            falls back to the site link.
          </li>
          <li>
            <strong>Liturgical calendar</strong> — computed in the app (Easter, seasons, lectionary
            years). The hymn catalogue is a small curated seed; check numbers in your own books.
          </li>
        </ul>
        <button
          className="btn ghost small"
          style={{ marginTop: 8 }}
          onClick={() => {
            if (window.confirm('Reset all settings to their defaults?')) onChange(DEFAULT_SETTINGS);
          }}
        >
          Reset settings to defaults
        </button>
      </div>
    </div>
  );
}
