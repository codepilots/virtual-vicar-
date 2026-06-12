import { useMemo } from 'react';
import type { ServicePlan, Settings } from '../lib/types';
import { buildRunSteps, dayFromIso, overlayLectionary, estimateDuration } from '../lib/plan';
import { getService } from '../data/services';
import { getBibleVersion } from '../data/bibleVersions';
import { getHymn } from '../data/hymns';
import { useDayReadings } from '../lib/api/hooks';

interface Props {
  plan: ServicePlan;
  settings: Settings;
  onBack: () => void;
}

/**
 * A clean, printable order of service assembled from the plan. The same step
 * pipeline as run mode (so it matches exactly), laid out as a document and
 * sent to the printer / "Save as PDF" via the browser.
 */
export function PrintSheet({ plan, settings, onBack }: Props) {
  const day = useMemo(() => dayFromIso(plan.dateIso), [plan.dateIso]);
  const service = getService(plan.serviceId);
  const lectionary = useDayReadings(plan.dateIso, settings.useOnlineSources);
  const bible = getBibleVersion(settings.bibleVersionId);

  const steps = useMemo(() => {
    const base = buildRunSteps(plan, settings);
    return overlayLectionary(base, lectionary.refs);
  }, [plan, settings, lectionary.refs]);

  const { totalMinutes } = useMemo(() => estimateDuration(steps), [steps]);

  if (!service) return null;

  return (
    <div className="print-screen">
      <div className="no-print btn-row" style={{ marginBottom: 12 }}>
        <button className="btn secondary" onClick={onBack}>
          ‹ Back
        </button>
        <button className="btn" onClick={() => window.print()}>
          ⎙ Print / Save as PDF
        </button>
      </div>

      <article className="sheet">
        <header className="sheet-head">
          <h1>{service.name}</h1>
          <p className="sheet-sub">
            {day.name} · {day.dateLabel}
          </p>
          <p className="sheet-sub">
            {service.tradition} · about {totalMinutes} minutes
          </p>
        </header>

        {steps.map((step, i) => (
          <section className="sheet-item" key={`${step.sectionId}-${i}`}>
            <h2>
              {step.title}
              {step.role === 'all' && <span className="sheet-role"> — All</span>}
              {step.role === 'reader' && <span className="sheet-role"> — Reader</span>}
            </h2>

            {step.kind === 'hymn' ? (
              <HymnLine step={step} />
            ) : (step.kind === 'reading' || step.kind === 'psalm') && step.refs && step.refs.length ? (
              <>
                <p className="sheet-ref">
                  {step.refs.map((r) => `${r.label ? `${r.label}: ` : ''}${r.book} ${r.passage}`).join('  ·  ')}
                </p>
                {step.text && <p className="sheet-text">{step.text}</p>}
                {!step.text && bible && (
                  <p className="sheet-ref subtle">
                    Read in {bible.code}: {step.refs.map((r) => `${r.book} ${r.passage}`).join('; ')}
                  </p>
                )}
              </>
            ) : step.text ? (
              <p className="sheet-text">{step.text}</p>
            ) : step.kind === 'prayers' ? (
              <p className="sheet-text subtle">Intercessions.</p>
            ) : step.kind === 'sermon' ? (
              <p className="sheet-text subtle">The Address.</p>
            ) : null}

            {step.note && <p className="sheet-note">{step.note}</p>}
          </section>
        ))}

        <footer className="sheet-foot">
          Prepared with Virtual Vicar. Liturgical texts © their respective owners;
          Coverdale Psalter &amp; BCP collects are public domain.
        </footer>
      </article>
    </div>
  );
}

function HymnLine({ step }: { step: ReturnType<typeof buildRunSteps>[number] }) {
  const choice = step.hymn;
  const hymn = choice ? getHymn(choice.hymnId) : undefined;
  if (!choice || !hymn) {
    return <p className="sheet-text subtle">A hymn of your choosing.</p>;
  }
  const tune = hymn.tunes.find((t) => t.id === choice.tuneId);
  return (
    <p className="sheet-text">
      <strong>{hymn.title}</strong>
      <br />
      <span className="subtle">
        Tune: {tune?.name ?? '—'} · {choice.verses} verse(s)
        {choice.includeChorus ? ' with chorus' : ''} · order: {choice.order.join(', ')}
      </span>
    </p>
  );
}
