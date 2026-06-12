import { useMemo, useState } from 'react';
import type { Season } from '../data/calendar';
import type { CongregationType } from '../data/congregation';
import { suggestHymns, getHymn, getHymnBook, hymnHasBundledMidi, type Hymn } from '../data/hymns';
import { tuneHasMidi, tuneMidiUrl, midiSearchUrl } from '../lib/midi';
import { useHymnaryHits } from '../lib/api/hooks';
import type { ScriptureRef } from '../data/readings';
import type { HymnChoice } from '../lib/types';

interface Props {
  sectionId: string;
  sectionTitle: string;
  season: Season;
  congregation: CongregationType | null;
  ownedBookIds: string[];
  /** The day's readings — used for Hymnary “matches the readings” lookups. */
  readingRefs: ScriptureRef[];
  /** Whether online lookups are enabled. */
  online: boolean;
  /** Only offer hymns whose tune MIDI is bundled with the app. */
  onlyBundledMidi: boolean;
  value: HymnChoice | undefined;
  onChange: (choice: HymnChoice | undefined) => void;
}

function defaultOrder(verses: number, hasChorus: boolean): string[] {
  const order: string[] = [];
  for (let i = 1; i <= verses; i += 1) {
    order.push(`v${i}`);
    if (hasChorus) order.push('chorus');
  }
  return order;
}

export function HymnPicker({
  sectionId,
  sectionTitle,
  season,
  congregation,
  ownedBookIds,
  readingRefs,
  online,
  onlyBundledMidi,
  value,
  onChange,
}: Props) {
  const suggestions = useMemo(
    () => suggestHymns(season, congregation, ownedBookIds, onlyBundledMidi),
    [season, congregation, ownedBookIds, onlyBundledMidi],
  );
  const [expanded, setExpanded] = useState(false);
  const chosen = value ? getHymn(value.hymnId) : undefined;
  // Online suggestions tied to the day's readings; only fetched while the
  // picker is open so we don't hit Hymnary for every collapsed slot.
  const hymnaryHits = useHymnaryHits(expanded && !chosen ? readingRefs : [], online);

  const choose = (hymn: Hymn) => {
    // When restricted to bundled tunes, start on a tune that actually has one.
    const tune = (onlyBundledMidi ? hymn.tunes.find((t) => t.midiFile) : undefined) ?? hymn.tunes[0];
    onChange({
      sectionId,
      hymnId: hymn.id,
      tuneId: tune?.id ?? '',
      verses: hymn.verses,
      includeChorus: Boolean(hymn.hasChorus),
      order: defaultOrder(hymn.verses, Boolean(hymn.hasChorus)),
      playMidi: false,
    });
    setExpanded(false);
  };

  const update = (patch: Partial<HymnChoice>) => {
    if (value) onChange({ ...value, ...patch });
  };

  return (
    <div className="card">
      <div className="title-row">
        <div>
          <h3>{sectionTitle}</h3>
          {chosen ? (
            <div className="subtle">{chosen.firstLine}</div>
          ) : (
            <div className="subtle">No hymn chosen — optional</div>
          )}
        </div>
        {chosen && (
          <button className="btn ghost small" onClick={() => onChange(undefined)}>
            Remove
          </button>
        )}
      </div>

      {!chosen && (
        <button className="btn secondary" onClick={() => setExpanded((e) => !e)}>
          {expanded ? 'Hide suggestions' : 'Choose a hymn'}
        </button>
      )}

      {!chosen && expanded && (
        <div style={{ marginTop: 10 }}>
          <p className="verify-note">
            <span className="unverified">⚠ Book numbers are hand-indexed and not yet verified</span>{' '}
            — confirm against your book’s own index before announcing.
          </p>
          {onlyBundledMidi && (
            <p className="subtle">
              Showing only hymns with a bundled tune (playable offline) — change in Settings.
            </p>
          )}
          {suggestions.length === 0 && (
            <p className="subtle">No hymns match your books yet — add hymn books in Settings.</p>
          )}
          {suggestions.map((h) => (
            <div key={h.id} className="card pressable" onClick={() => choose(h)}>
              <strong>{h.title}</strong>
              <div className="subtle">
                {hymnHasBundledMidi(h) ? '♫ tune included · ' : ''}
                {h.seasons.length ? h.seasons.join(', ') : 'Any season'} ·{' '}
                {Object.entries(h.numbers)
                  .filter(([b]) => ownedBookIds.length === 0 || ownedBookIds.includes(b))
                  .map(([b, n]) => `${getHymnBook(b)?.abbreviation ?? b} ${n}`)
                  .join(' · ') || 'number not listed'}
              </div>
            </div>
          ))}
          {hymnaryHits.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div className="subtle" style={{ marginBottom: 6 }}>
                Matching today’s readings (via Hymnary.org) — check your books for these:
              </div>
              {hymnaryHits.map((hit) => (
                <div key={hit.url} className="card">
                  <strong>{hit.title}</strong>
                  <div className="subtle">In {hit.hymnalCount} hymnals</div>
                  <a className="link" href={hit.url} target="_blank" rel="noreferrer">
                    View on Hymnary.org →
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {chosen && value && (
        <div style={{ marginTop: 10 }}>
          <div className="subtle" style={{ marginBottom: 8 }}>
            Found in:{' '}
            {Object.entries(chosen.numbers)
              .filter(([b]) => ownedBookIds.length === 0 || ownedBookIds.includes(b))
              .map(([b, n]) => `${getHymnBook(b)?.abbreviation ?? b} ${n}`)
              .join(' · ') || 'number not indexed — check your book’s index'}{' '}
            <span className="unverified" title="Numbers are hand-indexed; verify in the book">
              ⚠
            </span>
          </div>

          {chosen.tunes.length > 1 && (
            <div className="field">
              <label>Tune / setting</label>
              <select value={value.tuneId} onChange={(e) => update({ tuneId: e.target.value })}>
                {chosen.tunes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                    {t.metre ? ` (${t.metre})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="field">
            <label>Number of verses</label>
            <input
              type="number"
              min={1}
              max={Math.max(chosen.verses, 12)}
              value={value.verses}
              onChange={(e) => {
                const verses = Math.max(1, Number(e.target.value));
                update({ verses, order: defaultOrder(verses, value.includeChorus) });
              }}
            />
          </div>

          {chosen.hasChorus && (
            <label className="switch">
              <span className="sw-text">
                <span className="t">Include chorus / refrain</span>
                <span className="d">Sing the refrain after each verse.</span>
              </span>
              <input
                type="checkbox"
                className="toggle"
                checked={value.includeChorus}
                onChange={(e) =>
                  update({
                    includeChorus: e.target.checked,
                    order: defaultOrder(value.verses, e.target.checked),
                  })
                }
              />
            </label>
          )}

          <div className="field" style={{ marginTop: 12 }}>
            <label>Order of verses &amp; choruses</label>
            <input
              type="text"
              value={value.order.join(', ')}
              onChange={(e) =>
                update({ order: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })
              }
              style={{ fontFamily: 'inherit', fontSize: 15, padding: 11 }}
            />
            <div className="subtle" style={{ marginTop: 4 }}>
              e.g. <code>v1, chorus, v2, chorus, v3</code>
            </div>
          </div>

          {(() => {
            const tune = chosen.tunes.find((t) => t.id === value.tuneId);
            const hasMidi = tuneHasMidi(tune);
            return (
              <>
                <label className="switch">
                  <span className="sw-text">
                    <span className="t">Play the tune (MIDI) on the day</span>
                    <span className="d">
                      {tune?.midiFile
                        ? 'A public-domain MIDI is bundled with the app (works offline).'
                        : hasMidi
                          ? 'A MIDI file is available for this tune.'
                          : 'No MIDI catalogued — search link provided.'}
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    className="toggle"
                    checked={value.playMidi}
                    onChange={(e) => update({ playMidi: e.target.checked })}
                  />
                </label>
                <div className="subtle" style={{ marginTop: 6 }}>
                  {hasMidi ? (
                    <a className="link" href={tuneMidiUrl(tune)} target="_blank" rel="noreferrer">
                      Open the MIDI for “{tune!.name}”
                    </a>
                  ) : (
                    <a
                      className="link"
                      href={midiSearchUrl(tune?.name ?? chosen.title)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Find a MIDI for “{tune?.name ?? chosen.title}”
                    </a>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
