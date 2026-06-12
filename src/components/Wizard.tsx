import { useMemo, useState } from 'react';
import type { Settings, ServicePlan, HymnChoice } from '../lib/types';
import { SERVICES, getService } from '../data/services';
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
import { DayBanner } from './DayBanner';
import { HymnPicker } from './HymnPicker';

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

  const next = () => setStep((s) => Math.min(STEP_COUNT - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const hymnSections = service.sections.filter(
    (s) => s.kind === 'hymn' && (plan.includedSections[s.id] ?? s.defaultOn ?? true),
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
          <div className="card">
            {service.sections.map((s) => {
              const on = s.optional
                ? (plan.includedSections[s.id] ?? s.defaultOn ?? true)
                : true;
              return (
                <label className="switch" key={s.id}>
                  <span className="sw-text">
                    <span className="t">{s.title}</span>
                    <span className="d">
                      {s.optional ? 'Optional' : 'Always included'}
                      {s.note ? ` · ${s.note}` : ''}
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    className="toggle"
                    checked={on}
                    disabled={!s.optional}
                    onChange={(e) =>
                      update({
                        includedSections: {
                          ...plan.includedSections,
                          [s.id]: e.target.checked,
                        },
                      })
                    }
                  />
                </label>
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
            <a className="link" href={officialLectionaryUrl(day)} target="_blank" rel="noreferrer">
              Open the official lectionary for this date →
            </a>
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
                onChange={() => update({ address: { ...plan.address, resourceId: null } })}
              />
            </label>
          </div>
          {suggestAddressResources(day.season, settings.congregation).map((r) => (
            <div
              key={r.id}
              className="card pressable"
              onClick={() => update({ address: { ...plan.address, resourceId: r.id } })}
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
                  (s) => !s.optional || (plan.includedSections[s.id] ?? s.defaultOn ?? true),
                ).length
              }{' '}
              sections · {plan.hymns.length} hymn(s) ·{' '}
              {plan.address.resourceId ? 'address resource chosen' : 'own address'} · about{' '}
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
