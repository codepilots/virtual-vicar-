import { useMemo, useState } from 'react';
import type { Settings, ServicePlan, HymnChoice } from '../lib/types';
import { SERVICES, getService, isPlaceholderText, type ServiceSection } from '../data/services';
import { getBibleVersion } from '../data/bibleVersions';
import { officialLectionaryUrl } from '../data/readings';
import { getCollect, officialCollectUrl } from '../data/collects';
import { useDayReadings } from '../lib/api/hooks';
import { suggestAddressResources, resolveAddressResources, getAddressResource } from '../data/addressResources';
import { RecordingPlayer } from './RecordingPlayer';
import {
  buildRunSteps,
  dayFromIso,
  defaultPlan,
  estimateDuration,
  overlayLectionary,
  todayIso,
} from '../lib/plan';
import { saveSectionPrefs } from '../lib/storage';
import { parseCommonWorshipService } from '../lib/cwParser';
import { detectAlternativeGroups, type AltGroup } from '../lib/alternatives';
import { extractCwReferences, type CwReference } from '../lib/cwReferences';
import { INTERCESSION_PROMPTS, PREPARED_PRAYERS } from '../data/prayers';
import { DayBanner } from './DayBanner';
import { HymnPicker } from './HymnPicker';
import { FeedPreview } from './FeedPreview';

interface Props {
  settings: Settings;
  initialPlan: ServicePlan | null;
  onComplete: (plan: ServicePlan) => void;
  onPrint: (plan: ServicePlan) => void;
  onCancel: () => void;
}

type Section = ServiceSection;

// The wizard is one setup page, then a page per logical group of the service,
// then review. A group appears only if the chosen service has sections in it
// (and the Reflection only when enabled in Settings).
const GROUP_ORDER = ['prep', 'readings', 'canticles', 'prayers', 'hymns', 'reflection'] as const;
const GROUP_TITLES: Record<string, string> = {
  prep: 'Preparation & opening',
  readings: 'Psalms & Readings',
  canticles: 'Canticles',
  prayers: 'Prayers, Collect & the Lord’s Prayer',
  hymns: 'Hymns',
  reflection: 'The Reflection',
};

function sectionGroup(s: Section): string {
  if (s.kind === 'hymn') return 'hymns';
  if (s.kind === 'sermon') return 'reflection';
  if (/(?:^|-)canticle$|nunc|te-deum|benedictus|magnificat|venite/i.test(s.id)) return 'canticles';
  if (s.kind === 'psalm' || s.kind === 'reading') return 'readings';
  if (s.kind === 'prayers' || s.kind === 'collect') return 'prayers';
  if (/lords-prayer|suffrage|creed|responsor|response|conclusion|grace|dismissal|blessing|chrysostom/i.test(s.id))
    return 'prayers';
  return 'prep';
}

export function Wizard({ settings, initialPlan, onComplete, onPrint }: Props) {
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<ServicePlan>(
    () => initialPlan ?? defaultPlan(SERVICES[0].id, todayIso()),
  );

  const day = useMemo(() => dayFromIso(plan.dateIso), [plan.dateIso]);
  const service = getService(plan.serviceId)!;
  const bible = getBibleVersion(settings.bibleVersionId);
  const readings = useDayReadings(plan.dateIso, settings.useOnlineSources);

  const update = (patch: Partial<ServicePlan>) => setPlan((p) => ({ ...p, ...patch }));

  // Toggle an optional section and remember the choice for this service, so
  // the next plan for the same service starts from these selections.
  const toggleSection = (sectionId: string, on: boolean) => {
    const includedSections = { ...plan.includedSections, [sectionId]: on };
    saveSectionPrefs(plan.serviceId, includedSections);
    update({ includedSections });
  };

  // Store text the user pasted from an official source for a section
  // (empty/whitespace clears it).
  const setCustomText = (sectionId: string, text: string) => {
    const customTexts = { ...plan.customTexts };
    if (text.trim()) customTexts[sectionId] = text;
    else delete customTexts[sectionId];
    update({ customTexts });
  };

  const sectionOn = (s: Section) => !s.optional || (plan.includedSections[s.id] ?? false);

  // Which prepared intercession forms to include in run mode. Absent = offer
  // all (matching run mode's fallback); selecting materialises an explicit set.
  const selectedPrayerIds = plan.intercessions?.preparedIds ?? PREPARED_PRAYERS.map((p) => p.id);
  const togglePreparedPrayer = (id: string, on: boolean) => {
    const next = on ? [...selectedPrayerIds, id] : selectedPrayerIds.filter((x) => x !== id);
    update({ intercessions: { preparedIds: next } });
  };

  // Record which "or" alternative the leader prefers for a section's group.
  const setAlternative = (sectionId: string, groupIndex: number, optionIndex: number) => {
    const current = [...(plan.alternatives?.[sectionId] ?? [])];
    while (current.length <= groupIndex) current.push(-1);
    current[groupIndex] = optionIndex;
    update({ alternatives: { ...plan.alternatives, [sectionId]: current } });
  };

  const setHymn = (choice: HymnChoice | undefined, sectionId: string) => {
    const hymns = plan.hymns.filter((h) => h.sectionId !== sectionId);
    if (choice) hymns.push(choice);
    update({ hymns });
  };

  // Whole-service paste: parse one block from the C of E Daily Prayer page and
  // distribute it into the matching sections.
  const [wholePaste, setWholePaste] = useState('');
  const [parseSummary, setParseSummary] = useState<string | null>(null);
  // Whether the reflection-source list is expanded for (re)picking.
  const [pickingSource, setPickingSource] = useState(false);

  const distributeWholeService = () => {
    const result = parseCommonWorshipService(wholePaste, service);
    if (result.filledIds.length === 0) {
      setParseSummary(
        "Couldn't find the section headings — paste the whole page (use its “Copy to clipboard” button).",
      );
      return;
    }
    const customTexts = { ...plan.customTexts, ...result.texts };
    const includedSections = { ...plan.includedSections };
    for (const id of result.filledIds) {
      const sec = service.sections.find((s) => s.id === id);
      if (sec?.optional) includedSections[id] = true;
    }
    saveSectionPrefs(plan.serviceId, includedSections);
    update({ customTexts, includedSections });

    const titles = result.filledIds
      .map((id) => service.sections.find((s) => s.id === id)?.title)
      .filter(Boolean);
    setParseSummary(`Filled ${titles.length} section(s): ${titles.join(', ')}.`);
    setWholePaste('');
  };

  // Pages: setup, the groups present in this service, then review.
  const groupSections = (id: string) =>
    service.sections.filter(
      (s) => sectionGroup(s) === id && (s.kind !== 'sermon' || settings.allowReflection),
    );
  const activeGroups = GROUP_ORDER.filter((id) => groupSections(id).length > 0);
  const steps: string[] = ['setup', ...activeGroups, 'review'];
  const stepCount = steps.length;
  const stepKey = steps[Math.min(step, stepCount - 1)];

  const next = () => setStep((s) => Math.min(stepCount - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const estMinutes = useMemo(
    () => estimateDuration(overlayLectionary(buildRunSteps(plan, settings), readings.refs)).totalMinutes,
    [plan, settings, readings.refs],
  );

  // --- per-section configuration card (prep / canticles / prayers / hymns) ---
  const renderSection = (s: Section) => {
    const on = sectionOn(s);
    const custom = plan.customTexts?.[s.id] ?? '';
    return (
      <div key={s.id} className="card">
        <label className="switch">
          <span className="sw-text">
            <span className="t">{s.title}</span>
            <span className="d">
              {s.optional ? 'Optional' : 'Always included'}
              {isPlaceholderText(s.text) ? ' · text not bundled' : ''}
              {s.note ? ` · ${s.note}` : ''}
            </span>
          </span>
          <input
            type="checkbox"
            className="toggle"
            checked={on}
            disabled={!s.optional}
            onChange={(e) => toggleSection(s.id, e.target.checked)}
          />
        </label>

        {on && s.kind === 'hymn' && (
          <HymnPicker
            sectionId={s.id}
            sectionTitle={s.title}
            season={day.season}
            congregation={settings.congregation}
            ownedBookIds={settings.ownedHymnBookIds}
            readingRefs={readings.refs}
            online={settings.useOnlineSources}
            onlyBundledMidi={settings.onlyBundledMidi}
            value={plan.hymns.find((h) => h.sectionId === s.id)}
            onChange={(c) => setHymn(c, s.id)}
          />
        )}

        {on && s.kind === 'prayers' && (
          <IntercessionPicker
            biddings={custom}
            onChangeBiddings={(t) => setCustomText(s.id, t)}
            selectedIds={selectedPrayerIds}
            onTogglePrepared={togglePreparedPrayer}
          />
        )}

        {on && s.kind === 'collect' && (
          <div style={{ marginTop: 8 }}>
            {(() => {
              const c = getCollect(day, service.tradition);
              return c?.collect ? (
                <>
                  <p className="spoken" style={{ fontSize: 15 }}>
                    {c.collect}
                  </p>
                  <p className="verify-note">
                    {c.source && <span>Source: {c.source}.</span>}{' '}
                    {c.verified === false && (
                      <span className="unverified">⚠ Hand-transcribed — check before use.</span>
                    )}
                  </p>
                </>
              ) : (
                <p className="subtle">Not catalogued offline.</p>
              );
            })()}
            <a className="link" href={officialCollectUrl(day)} target="_blank" rel="noreferrer">
              View the authorised collect →
            </a>
            <PasteTextBox
              label="Paste the collect for offline use & read-aloud"
              value={custom}
              onChange={(t) => setCustomText(s.id, t)}
            />
          </div>
        )}

        {on && s.kind !== 'hymn' && s.kind !== 'prayers' && s.kind !== 'collect' && isPlaceholderText(s.text) && (
          <PasteTextBox
            label={`Paste the authorised text for “${s.title}”`}
            value={custom}
            onChange={(t) => setCustomText(s.id, t)}
          />
        )}
        {on && s.kind !== 'hymn' && s.kind !== 'psalm' && s.kind !== 'reading' && (
          <AlternativesPicker
            groups={detectAlternativeGroups(custom)}
            choices={plan.alternatives?.[s.id] ?? []}
            onChoose={(gi, oi) => setAlternative(s.id, gi, oi)}
          />
        )}
        {on && s.kind !== 'hymn' && <CwReferences refs={extractCwReferences(custom)} />}
      </div>
    );
  };

  // --- Psalms & Readings page: the day's readings, then each psalm/reading ---
  const renderReadingsGroup = () => (
    <div>
      <h2>{GROUP_TITLES.readings}</h2>
      <DayBanner day={day} />
      <div className="card">
        <h3>Readings for the day</h3>
        <p className="subtle">
          Bible version: {bible?.name} ({bible?.code}). Tap a reading to open it.
        </p>
        {readings.loading ? (
          <p className="subtle">Looking up the lectionary…</p>
        ) : (
          <ul className="refs">
            {readings.refs.map((ref, i) => (
              <li key={i}>
                <a className="link" href={bible?.url(ref)} target="_blank" rel="noreferrer">
                  {ref.label ? `${ref.label}: ` : ''}
                  {ref.book} {ref.passage}
                </a>
              </li>
            ))}
            {readings.refs.length === 0 && (
              <li className="subtle">
                Couldn’t look up readings (offline?) — use the official lectionary below.
              </li>
            )}
          </ul>
        )}
        {readings.source === 'lectserve' && (
          <p className="subtle" style={{ fontSize: 12 }}>
            Readings via LectServe (Revised Common Lectionary) — verify against the official
            lectionary for Second/Third Service variations.
          </p>
        )}
        <a
          className="link"
          href={officialLectionaryUrl(day, service.timeOfDay, service.tradition === 'Book of Common Prayer')}
          target="_blank"
          rel="noreferrer"
        >
          Open the official lectionary for this date →
        </a>
      </div>
      {groupSections('readings').map((s) => {
        const on = sectionOn(s);
        const custom = plan.customTexts?.[s.id] ?? '';
        return (
          <div key={s.id} className="card">
            <label className="switch">
              <span className="sw-text">
                <span className="t">{s.title}</span>
                <span className="d">{s.optional ? 'Optional' : 'Always included'}{s.note ? ` · ${s.note}` : ''}</span>
              </span>
              <input
                type="checkbox"
                className="toggle"
                checked={on}
                disabled={!s.optional}
                onChange={(e) => toggleSection(s.id, e.target.checked)}
              />
            </label>
            {on && !s.text && (
              <PasteTextBox
                label={`Paste the text of “${s.title}” for offline use & read-aloud`}
                value={custom}
                onChange={(t) => setCustomText(s.id, t)}
              />
            )}
            {on && <CwReferences refs={extractCwReferences(custom)} />}
          </div>
        );
      })}
    </div>
  );

  // --- The Reflection page: include toggle, then source picker + notes ---
  const renderReflectionGroup = () => {
    const sermon = service.sections.find((s) => s.kind === 'sermon');
    if (!sermon) return null;
    const on = sectionOn(sermon);
    const sources = resolveAddressResources(settings.hiddenSourceIds, settings.customSources);
    const chosen = plan.address.resourceId ? getAddressResource(plan.address.resourceId, sources) : undefined;
    const pickOwn = () =>
      update({
        address: { ...plan.address, resourceId: null, itemTitle: undefined, itemUrl: undefined, itemAudioUrl: undefined },
      });
    const selectedKey = plan.address.itemAudioUrl ?? plan.address.itemUrl;
    return (
      <div>
        <h2>{GROUP_TITLES.reflection}</h2>
        <div className="card">
          <label className="switch">
            <span className="sw-text">
              <span className="t">Include a reflection</span>
              <span className="d">A short reflection or address (with the incumbent’s permission).</span>
            </span>
            <input
              type="checkbox"
              className="toggle"
              checked={on}
              onChange={(e) => toggleSection(sermon.id, e.target.checked)}
            />
          </label>
        </div>
        {!on ? (
          <p className="subtle">Turn on “Include a reflection” to choose a resource and write your notes.</p>
        ) : (
          <>
            <p className="subtle">
              Pick a resource to draw on, or note your own outline. Filtered for a{' '}
              {settings.congregation ?? 'general'} congregation.
            </p>
            <div className="card">
              <label className="switch">
                <span className="sw-text">
                  <span className="t">I’ll prepare my own</span>
                </span>
                <input type="checkbox" className="toggle" checked={plan.address.resourceId === null} onChange={pickOwn} />
              </label>
            </div>

            {chosen && !pickingSource ? (
              <div className="card" style={{ borderColor: 'var(--primary)', borderWidth: 2 }}>
                <div className="title-row">
                  <strong>{chosen.title}</strong>
                  <span className="role-badge">{chosen.kind}</span>
                </div>
                <div className="subtle">{chosen.author}</div>
                {plan.address.itemTitle && (
                  <p style={{ margin: '6px 0 0', fontSize: 14 }}>
                    Chosen: <strong>“{plan.address.itemTitle}”</strong>
                    {plan.address.itemUrl && (
                      <>
                        {' '}
                        <a className="link" href={plan.address.itemUrl} target="_blank" rel="noreferrer">
                          ↗
                        </a>
                      </>
                    )}
                  </p>
                )}
                {plan.address.itemAudioUrl && <RecordingPlayer url={plan.address.itemAudioUrl} />}
                <div className="btn-row" style={{ marginTop: 8 }}>
                  <button className="btn secondary small" onClick={() => setPickingSource(true)}>
                    Choose a different source
                  </button>
                </div>
              </div>
            ) : (
              suggestAddressResources(day.season, settings.congregation, sources).map((r) => (
                <div
                  key={r.id}
                  className="card pressable"
                  onClick={() => {
                    update({
                      address:
                        plan.address.resourceId === r.id
                          ? { ...plan.address }
                          : { ...plan.address, resourceId: r.id, itemTitle: undefined, itemUrl: undefined, itemAudioUrl: undefined },
                    });
                    setPickingSource(false);
                  }}
                  style={{
                    borderColor: plan.address.resourceId === r.id ? 'var(--primary)' : undefined,
                    borderWidth: plan.address.resourceId === r.id ? 2 : 1,
                  }}
                >
                  <div className="title-row">
                    <strong>{r.title}</strong>
                    <span className="role-badge">{r.kind}</span>
                  </div>
                  <div className="subtle">{r.author}</div>
                  <p style={{ margin: '6px 0 8px', fontSize: 14 }}>{r.description}</p>
                  <a className="link" href={r.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                    Open resource →
                  </a>
                  <FeedPreview
                    resource={r}
                    online={settings.useOnlineSources}
                    selectedKey={plan.address.resourceId === r.id ? selectedKey : undefined}
                    onSelectItem={(item) => {
                      update({
                        address: {
                          ...plan.address,
                          resourceId: r.id,
                          itemTitle: item.title,
                          itemUrl: item.link,
                          itemAudioUrl: item.audioUrl,
                          notes: item.content ?? plan.address.notes,
                        },
                      });
                      setPickingSource(false);
                    }}
                  />
                </div>
              ))
            )}

            <div className="card">
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Your notes / outline (optional)</label>
                <textarea
                  value={plan.address.notes ?? ''}
                  onChange={(e) => update({ address: { ...plan.address, notes: e.target.value } })}
                  placeholder="Key points, illustration, application…"
                  rows={14}
                  style={{ minHeight: 260, lineHeight: 1.5 }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderGroup = (id: string) => {
    if (id === 'readings') return renderReadingsGroup();
    if (id === 'reflection') return renderReflectionGroup();
    return (
      <div>
        <h2>{GROUP_TITLES[id]}</h2>
        {groupSections(id).map(renderSection)}
      </div>
    );
  };

  return (
    <div>
      <div className="steps">
        {Array.from({ length: stepCount }).map((_, i) => (
          <div key={i} className={`dot ${i < step ? 'done' : i === step ? 'active' : ''}`} />
        ))}
      </div>

      {/* Page 1 — service, date & whole-service paste */}
      {stepKey === 'setup' && (
        <div>
          <h2>Which service &amp; when?</h2>
          <p className="subtle">Only offices a lay person may lead are listed.</p>
          {SERVICES.map((s) => (
            <div
              key={s.id}
              className="card pressable"
              onClick={() => setPlan(defaultPlan(s.id, plan.dateIso))}
              style={{
                borderColor: s.id === plan.serviceId ? 'var(--primary)' : undefined,
                borderWidth: s.id === plan.serviceId ? 2 : 1,
              }}
            >
              <strong>{s.name}</strong>
              <div className="subtle">
                {s.tradition} · {s.summary}
              </div>
            </div>
          ))}
          <div className="field" style={{ marginTop: 12 }}>
            <label>Date of the service</label>
            <input
              type="date"
              value={plan.dateIso}
              onChange={(e) => update({ dateIso: e.target.value || todayIso() })}
            />
          </div>
          <DayBanner day={day} />

          {service.tradition === 'Common Worship' && (
            <div className="card" style={{ marginTop: 12 }}>
              <h3>Paste the whole service</h3>
              <p className="subtle" style={{ fontSize: 13 }}>
                Common Worship wording is © The Archbishops’ Council, so it isn’t shipped with the
                app. If your parish holds the usual reproduction licence, paste the day’s service
                and it’s split across the following pages — shown, printed and read aloud offline.
              </p>
              <ol className="subtle" style={{ fontSize: 13, paddingLeft: 18, marginTop: 8 }}>
                <li>
                  <a className="link" href={officialLectionaryUrl(day, service.timeOfDay, false)} target="_blank" rel="noreferrer">
                    Open today’s {service.name} on the C of E site →
                  </a>
                </li>
                <li>Tap its “Copy to clipboard” button (or select all the service text).</li>
                <li>Paste below and tap <strong>Distribute into sections</strong>.</li>
              </ol>
              <textarea
                value={wholePaste}
                onChange={(e) => setWholePaste(e.target.value)}
                rows={6}
                placeholder="Paste the whole Daily Prayer service here…"
                style={{ width: '100%', marginTop: 6, padding: 10, fontFamily: 'inherit', fontSize: 14, boxSizing: 'border-box' }}
              />
              <div className="btn-row" style={{ marginTop: 8 }}>
                <button className="btn secondary small" onClick={distributeWholeService} disabled={!wholePaste.trim()}>
                  Distribute into sections
                </button>
              </div>
              {parseSummary && (
                <p className="subtle" style={{ fontSize: 13, marginTop: 8 }}>
                  {parseSummary}
                </p>
              )}
              <p className="subtle" style={{ fontSize: 12, marginTop: 6 }}>
                Stored only on this device (and in plans you share or back up). Please make sure your
                parish holds the right to reproduce the texts.
              </p>
            </div>
          )}
        </div>
      )}

      {/* A page per logical group of the service */}
      {stepKey !== 'setup' && stepKey !== 'review' && renderGroup(stepKey)}

      {/* Last page — review & begin */}
      {stepKey === 'review' && (
        <div>
          <h2>Ready to lead</h2>
          <DayBanner day={day} />
          <div className="card">
            <h3>{service.name}</h3>
            <div className="subtle">
              {
                service.sections.filter(
                  (s) =>
                    (s.kind !== 'sermon' || settings.allowReflection) &&
                    (!s.optional || (plan.includedSections[s.id] ?? false)),
                ).length
              }{' '}
              sections · {plan.hymns.length} hymn(s)
              {settings.allowReflection && (
                <>
                  {' '}·{' '}
                  {plan.address.itemTitle
                    ? `reflection: “${plan.address.itemTitle}”`
                    : plan.address.resourceId
                      ? 'reflection resource chosen'
                      : 'own reflection'}
                </>
              )}{' '}
              · about <strong>{estMinutes} min</strong>
            </div>
          </div>
          <p className="subtle">
            In run mode you’ll get one step at a time with a <strong>Skip</strong> for anything you
            leave out on the day{settings.ttsEnabled ? ', and I can read the officiant parts aloud' : ''}.
          </p>
          <button className="btn" onClick={() => onComplete(plan)}>
            ▶ Begin the service
          </button>
          <div className="btn-row">
            <button className="btn secondary" onClick={() => onPrint(plan)}>
              ⎙ Print / PDF
            </button>
          </div>
        </div>
      )}

      <div className="btn-row">
        {step > 0 && (
          <button className="btn secondary" onClick={back}>
            ‹ Back
          </button>
        )}
        {step < stepCount - 1 && (
          <button className="btn" onClick={next}>
            Next ›
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Choose the intercessions ahead of time: note your own biddings (or paste the
 * day's, which the whole-service paste also fills in here) and pick which
 * prepared forms to have ready in run mode. Run mode then shows only these.
 */
function IntercessionPicker({
  biddings,
  onChangeBiddings,
  selectedIds,
  onTogglePrepared,
}: {
  biddings: string;
  onChangeBiddings: (text: string) => void;
  selectedIds: string[];
  onTogglePrepared: (id: string, on: boolean) => void;
}) {
  return (
    <div className="card" style={{ margin: '4px 0 10px', padding: 12 }}>
      <div className="field" style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 14 }}>Your biddings / intercession outline</label>
        <textarea
          value={biddings}
          onChange={(e) => onChangeBiddings(e.target.value)}
          rows={4}
          placeholder={`Leave blank for the classic shape:\n${INTERCESSION_PROMPTS.map((p) => `• ${p}`).join('\n')}`}
          style={{ width: '100%', padding: 10, fontFamily: 'inherit', fontSize: 14, boxSizing: 'border-box' }}
        />
      </div>
      <div className="subtle" style={{ fontSize: 13, marginBottom: 4 }}>
        Prepared forms to have ready:
      </div>
      {PREPARED_PRAYERS.map((p) => (
        <label key={p.id} className="switch" style={{ alignItems: 'flex-start' }}>
          <span className="sw-text">
            <span className="t">{p.title}</span>
            {p.occasion && <span className="d">{p.occasion}</span>}
          </span>
          <input
            type="checkbox"
            className="toggle"
            checked={selectedIds.includes(p.id)}
            onChange={(e) => onTogglePrepared(p.id, e.target.checked)}
          />
        </label>
      ))}
    </div>
  );
}

/**
 * Other Common Worship resources this section points to (the Acclamation, a
 * canticle, the prayer cycles). The copied text keeps the page number but not
 * the original URL, so each is shown with its Daily Prayer page and a lookup.
 */
function CwReferences({ refs }: { refs: CwReference[] }) {
  if (refs.length === 0) return null;
  return (
    <div className="subtle" style={{ margin: '2px 0 10px', fontSize: 13 }}>
      <div style={{ marginBottom: 2 }}>Also referenced (Common Worship: Daily Prayer):</div>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {refs.map((r, i) => (
          <li key={i} style={{ marginBottom: 2 }}>
            <a className="link" href={r.url} target="_blank" rel="noreferrer">
              {r.label} ↗
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Where a pasted section offers "or" alternatives (two forms of the Lord's
 * Prayer, a choice of opening prayer, a hymn or canticle…), let the leader pick
 * the one they'll use. Run mode and the print sheet then show only that; the
 * default keeps them all to decide on the day.
 */
function AlternativesPicker({
  groups,
  choices,
  onChoose,
}: {
  groups: AltGroup[];
  choices: number[];
  onChoose: (groupIndex: number, optionIndex: number) => void;
}) {
  if (groups.length === 0) return null;
  return (
    <div className="card" style={{ margin: '4px 0 10px', padding: 12 }}>
      <div className="subtle" style={{ fontSize: 13, marginBottom: 6 }}>
        This part offers {groups.length === 1 ? 'a choice' : `${groups.length} choices`} — pick what you’ll use:
      </div>
      {groups.map((g, gi) => {
        const chosen = choices[gi] ?? -1;
        return (
          <div key={gi} style={{ marginBottom: gi < groups.length - 1 ? 10 : 0 }}>
            {groups.length > 1 && (
              <div className="subtle" style={{ fontSize: 12, marginBottom: 2 }}>
                Choice {gi + 1}
              </div>
            )}
            <label className="alt-opt" style={{ display: 'flex', gap: 8, alignItems: 'baseline', padding: '3px 0' }}>
              <input type="radio" checked={chosen < 0} onChange={() => onChoose(gi, -1)} />
              <span>Show all (decide on the day)</span>
            </label>
            {g.options.map((o, oi) => (
              <label key={oi} className="alt-opt" style={{ display: 'flex', gap: 8, alignItems: 'baseline', padding: '3px 0' }}>
                <input type="radio" checked={chosen === oi} onChange={() => onChoose(gi, oi)} />
                <span>“{o.label}”</span>
              </label>
            ))}
          </div>
        );
      })}
    </div>
  );
}

/**
 * A collapsible textarea for pasting text from an official source (e.g. the
 * C of E website) into a section, so it works offline and can be read aloud.
 * Starts open when it already holds text.
 */
function PasteTextBox({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (text: string) => void;
}) {
  return (
    <details open={Boolean(value)} style={{ margin: '4px 0 10px' }}>
      <summary className="link" style={{ cursor: 'pointer', fontSize: 14 }}>
        {value ? `✓ ${label}` : label}
      </summary>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        placeholder="Paste the text here…"
        style={{
          width: '100%',
          marginTop: 6,
          padding: 10,
          fontFamily: 'inherit',
          fontSize: 15,
          boxSizing: 'border-box',
        }}
      />
      <div className="subtle" style={{ fontSize: 12, marginTop: 2 }}>
        Stored only on this device (and in plans you share or back up). Please make sure your
        parish holds the right to reproduce it — Common Worship texts are © The Archbishops’
        Council and most parishes hold the standard local-reproduction licence.
      </div>
    </details>
  );
}
