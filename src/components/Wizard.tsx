import { useMemo, useState } from 'react';
import type { Settings, ServicePlan, HymnChoice } from '../lib/types';
import { SERVICES, getService, isPlaceholderText } from '../data/services';
import { getBibleVersion } from '../data/bibleVersions';
import { officialLectionaryUrl } from '../data/readings';
import { getCollect, officialCollectUrl } from '../data/collects';
import { useDayReadings } from '../lib/api/hooks';
import { suggestAddressResources } from '../data/addressResources';
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

const STEP_COUNT = 6;

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

  const sectionOn = (s: (typeof service.sections)[number]) =>
    !s.optional || (plan.includedSections[s.id] ?? false);

  // Whole-service paste: parse one block from the C of E Daily Prayer page and
  // distribute it into the matching sections.
  const [wholePaste, setWholePaste] = useState('');
  const [parseSummary, setParseSummary] = useState<string | null>(null);

  const distributeWholeService = () => {
    const result = parseCommonWorshipService(wholePaste, service);
    if (result.filledIds.length === 0) {
      setParseSummary(
        "Couldn't find the section headings — paste the whole page (use its “Copy to clipboard” button).",
      );
      return;
    }
    // Merge parsed text in, and switch on any optional section we filled.
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

  const next = () => setStep((s) => Math.min(STEP_COUNT - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const hymnSections = service.sections.filter(
    (s) => s.kind === 'hymn' && (plan.includedSections[s.id] ?? false),
  );

  const estMinutes = useMemo(
    () => estimateDuration(overlayLectionary(buildRunSteps(plan, settings), readings.refs)).totalMinutes,
    [plan, settings, readings.refs],
  );

  const setHymn = (choice: HymnChoice | undefined, sectionId: string) => {
    const hymns = plan.hymns.filter((h) => h.sectionId !== sectionId);
    if (choice) hymns.push(choice);
    update({ hymns });
  };

  return (
    <div>
      <div className="steps">
        {Array.from({ length: STEP_COUNT }).map((_, i) => (
          <div key={i} className={`dot ${i < step ? 'done' : i === step ? 'active' : ''}`} />
        ))}
      </div>

      {/* Step 1 — service & date */}
      {step === 0 && (
        <div>
          <h2>Which service?</h2>
          <p className="subtle">Only offices a lay person may lead are listed.</p>
          {SERVICES.map((s) => (
            <div
              key={s.id}
              className="card pressable"
              onClick={() =>
                setPlan(defaultPlan(s.id, plan.dateIso))
              }
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
        </div>
      )}

      {/* Step 2 — optional parts */}
      {step === 1 && (
        <div>
          <h2>Which parts will you include?</h2>
          <p className="subtle">Turn optional sections on or off. Fixed parts are always shown.</p>
          {service.tradition === 'Common Worship' && (
            <>
              <p className="subtle">
                Sections marked “text not bundled” show only a placeholder: the Common Worship
                wording is © The Archbishops’ Council, so it isn’t shipped with the app. If your
                parish holds the usual reproduction licence, paste the wording in and it will be
                shown, printed and read aloud — even offline.
              </p>
              <details className="card" style={{ marginBottom: 12 }}>
                <summary className="link" style={{ cursor: 'pointer' }}>
                  ⚡ Paste the whole service at once
                </summary>
                <ol className="subtle" style={{ fontSize: 13, paddingLeft: 18, marginTop: 8 }}>
                  <li>
                    <a
                      className="link"
                      href={officialLectionaryUrl(
                        day,
                        service.timeOfDay,
                        false,
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
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
                  style={{
                    width: '100%',
                    marginTop: 6,
                    padding: 10,
                    fontFamily: 'inherit',
                    fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
                <div className="btn-row" style={{ marginTop: 8 }}>
                  <button
                    className="btn secondary small"
                    onClick={distributeWholeService}
                    disabled={!wholePaste.trim()}
                  >
                    Distribute into sections
                  </button>
                </div>
                {parseSummary && (
                  <p className="subtle" style={{ fontSize: 13, marginTop: 8 }}>
                    {parseSummary}
                  </p>
                )}
                <p className="subtle" style={{ fontSize: 12, marginTop: 6 }}>
                  Stored only on this device (and in plans you share or back up). Please make sure
                  your parish holds the right to reproduce the texts.
                </p>
              </details>
            </>
          )}
          <div className="card">
            {service.sections.map((s) => {
              const on = s.optional ? (plan.includedSections[s.id] ?? false) : true;
              return (
                <div key={s.id}>
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
                  {on && isPlaceholderText(s.text) && (
                    <PasteTextBox
                      label={`Paste the authorised text for “${s.title}”`}
                      value={plan.customTexts?.[s.id] ?? ''}
                      onChange={(t) => setCustomText(s.id, t)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3 — readings & collect */}
      {step === 2 && (
        <div>
          <h2>Readings &amp; Collect</h2>
          <DayBanner day={day} />
          <div className="card">
            <h3>The Collect of the Day</h3>
            {(() => {
              const c = getCollect(day, service.tradition);
              return c?.collect ? (
                <>
                  <p className="spoken" style={{ fontSize: 16 }}>
                    {c.collect}
                  </p>
                  <p className="verify-note">
                    {c.source && <span>Source: {c.source}.</span>}{' '}
                    {c.verified === false && (
                      <span className="unverified">
                        ⚠ Hand-transcribed, not yet proofread — please check against the official
                        text below before use.
                      </span>
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
            {(() => {
              const collectSection = service.sections.find((s) => s.kind === 'collect');
              return collectSection && sectionOn(collectSection) ? (
                <PasteTextBox
                  label="Paste the collect for offline use & read-aloud"
                  value={plan.customTexts?.[collectSection.id] ?? ''}
                  onChange={(t) => setCustomText(collectSection.id, t)}
                />
              ) : null;
            })()}
          </div>
          <div className="card">
            <h3>Readings</h3>
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
              href={officialLectionaryUrl(
                day,
                service.timeOfDay,
                service.tradition === 'Book of Common Prayer',
              )}
              target="_blank"
              rel="noreferrer"
            >
              Open the official lectionary for this date →
            </a>
            {service.sections
              .filter((s) => (s.kind === 'reading' || s.kind === 'psalm') && !s.text && sectionOn(s))
              .map((s) => (
                <PasteTextBox
                  key={s.id}
                  label={`Paste the text of “${s.title}” for offline use & read-aloud`}
                  value={plan.customTexts?.[s.id] ?? ''}
                  onChange={(t) => setCustomText(s.id, t)}
                />
              ))}
          </div>
        </div>
      )}

      {/* Step 4 — hymns */}
      {step === 3 && (
        <div>
          <h2>Hymns</h2>
          <p className="subtle">
            Suggestions are drawn from your hymn books and suit {day.season}. Include as many or few
            as you like.
          </p>
          {hymnSections.length === 0 && (
            <p className="subtle">This service has no hymn slots enabled.</p>
          )}
          {hymnSections.map((s) => (
            <HymnPicker
              key={s.id}
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
          ))}
        </div>
      )}

      {/* Step 5 — address */}
      {step === 4 && (
        <div>
          <h2>The Address</h2>
          <p className="subtle">
            Pick a resource to draw on, or note your own outline. Filtered for a{' '}
            {settings.congregation ?? 'general'} congregation.
          </p>
          <div className="card">
            <label className="switch">
              <span className="sw-text">
                <span className="t">I’ll prepare my own</span>
              </span>
              <input
                type="checkbox"
                className="toggle"
                checked={plan.address.resourceId === null}
                onChange={() =>
                  update({
                    address: {
                      ...plan.address,
                      resourceId: null,
                      itemTitle: undefined,
                      itemUrl: undefined,
                    },
                  })
                }
              />
            </label>
          </div>
          {plan.address.itemTitle && (
            <p className="subtle">
              Chosen for the address: <strong>“{plan.address.itemTitle}”</strong>
            </p>
          )}
          {suggestAddressResources(day.season, settings.congregation).map((r) => (
            <div
              key={r.id}
              className="card pressable"
              onClick={() =>
                update({
                  address:
                    plan.address.resourceId === r.id
                      ? { ...plan.address }
                      : // Switching resource drops a post picked from the old one.
                        { ...plan.address, resourceId: r.id, itemTitle: undefined, itemUrl: undefined },
                })
              }
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
                selectedUrl={plan.address.resourceId === r.id ? plan.address.itemUrl : undefined}
                onSelectItem={(item) =>
                  update({
                    address: {
                      ...plan.address,
                      resourceId: r.id,
                      itemTitle: item.title,
                      itemUrl: item.link,
                    },
                  })
                }
              />
            </div>
          ))}
          <div className="card">
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Your notes / outline (optional)</label>
              <textarea
                value={plan.address.notes ?? ''}
                onChange={(e) => update({ address: { ...plan.address, notes: e.target.value } })}
                placeholder="Key points, illustration, application…"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 6 — review */}
      {step === 5 && (
        <div>
          <h2>Ready to lead</h2>
          <DayBanner day={day} />
          <div className="card">
            <h3>{service.name}</h3>
            <div className="subtle">
              {
                service.sections.filter(
                  (s) => !s.optional || (plan.includedSections[s.id] ?? false),
                ).length
              }{' '}
              sections · {plan.hymns.length} hymn(s) ·{' '}
              {plan.address.itemTitle
                ? `address: “${plan.address.itemTitle}”`
                : plan.address.resourceId
                  ? 'address resource chosen'
                  : 'own address'}{' '}
              · about{' '}
              <strong>{estMinutes} min</strong>
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
        {step < STEP_COUNT - 1 && (
          <button className="btn" onClick={next}>
            Next ›
          </button>
        )}
      </div>
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
