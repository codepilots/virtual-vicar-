import { useEffect, useMemo, useRef, useState } from 'react';
import type { Settings, ServicePlan } from '../lib/types';
import {
  buildRunSteps,
  dayFromIso,
  estimateDuration,
  overlayLectionary,
  type RunStep,
} from '../lib/plan';
import { getBibleVersion } from '../data/bibleVersions';
import { getHymn } from '../data/hymns';
import { speak, cancelSpeech } from '../lib/tts';
import { loadMidiPlayer, tuneMidiUrl, listenUrl } from '../lib/midi';
import { Liturgy, liturgySpeech } from './Liturgy';
import { useWakeLock } from '../lib/useWakeLock';
import { INTERCESSION_PROMPTS, PREPARED_PRAYERS } from '../data/prayers';
import { useDayReadings, usePassageText } from '../lib/api/hooks';

interface Props {
  plan: ServicePlan;
  settings: Settings;
  onExit: () => void;
}

const MIN_SCALE = 0.85;
const MAX_SCALE = 1.8;

export function RunMode({ plan, settings, onExit }: Props) {
  const baseSteps = useMemo(() => buildRunSteps(plan, settings), [plan, settings]);
  const day = useMemo(() => dayFromIso(plan.dateIso), [plan.dateIso]);
  const bible = getBibleVersion(settings.bibleVersionId);
  const [index, setIndex] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [scale, setScale] = useState(settings.runTextScale || 1);

  // Keep the screen awake while leading.
  useWakeLock(true);

  // Fill reading/psalm slots from the online lectionary where the local table
  // had nothing; offline this is a no-op and the official-lectionary links stay.
  const lectionary = useDayReadings(plan.dateIso, settings.useOnlineSources);
  const steps = useMemo(
    () => overlayLectionary(baseSteps, lectionary.refs),
    [baseSteps, lectionary.refs],
  );

  // Estimated minutes still to come, from the current step onward.
  const remainingMinutes = useMemo(() => {
    const { perStep } = estimateDuration(steps);
    const secs = perStep.slice(index).reduce((a, b) => a + b, 0);
    return Math.round(secs / 60);
  }, [steps, index]);

  const rawStep = steps[index];
  const atEnd = index >= steps.length;

  // For the current reading/psalm step, fetch the passage text in the user's
  // version when it has a public-domain source — shown inline and readable
  // aloud by TTS. Other versions keep their deep link only.
  const passage = usePassageText(
    rawStep && (rawStep.kind === 'reading' || rawStep.kind === 'psalm')
      ? rawStep.refs?.[0]
      : undefined,
    settings.bibleVersionId,
    settings.useOnlineSources,
  );
  const step: RunStep | undefined =
    rawStep && passage && !rawStep.text
      ? {
          ...rawStep,
          text: passage.text,
          attribution: `${passage.translationName} · via bible-api.com`,
          unverified: false, // fetched from source, not a transcription
        }
      : rawStep;

  // Text for the read-aloud voice: only the spoken parts (rubrics, citations,
  // verse numbers and pointing marks removed).
  const spokenTextFor = (s: RunStep): string => liturgySpeech(s.text ?? '');

  // Auto-read officiant text when enabled and the step changes.
  useEffect(() => {
    cancelSpeech();
    setSpeaking(false);
    if (!step || !settings.ttsEnabled) return;
    const shouldSpeak =
      step.text && (step.role === 'officiant' || step.kind === 'collect' || step.kind === 'responsive');
    if (shouldSpeak && step.text) {
      setSpeaking(true);
      speak(spokenTextFor(step), {
        voiceName: settings.ttsVoice,
        rate: settings.ttsRate,
        onEnd: () => setSpeaking(false),
      });
    }
    return () => cancelSpeech();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const go = (delta: number) => {
    cancelSpeech();
    setSpeaking(false);
    setIndex((i) => Math.max(0, Math.min(steps.length, i + delta)));
  };

  const toggleSpeak = () => {
    if (speaking) {
      cancelSpeech();
      setSpeaking(false);
    } else if (step?.text) {
      setSpeaking(true);
      speak(spokenTextFor(step), {
        voiceName: settings.ttsVoice,
        rate: settings.ttsRate,
        onEnd: () => setSpeaking(false),
      });
    }
  };

  if (atEnd) {
    return (
      <div className="run">
        <h2>The service is ended.</h2>
        <p className="subtle">Go in peace. {day.dateLabel}.</p>
        <button className="btn" onClick={onExit}>
          Finish
        </button>
        <button className="btn secondary" onClick={() => setIndex(0)} style={{ marginTop: 10 }}>
          Start again
        </button>
      </div>
    );
  }

  return (
    <div className="run" style={{ ['--run-scale' as string]: scale }}>
      <div className="run-step">
        <div className="run-progress">
          <span>
            Step {index + 1} of {steps.length} · {day.name}
          </span>
          <span className="run-tools">
            ~{remainingMinutes} min left
            <button
              className="text-size-btn"
              aria-label="Smaller text"
              onClick={() => setScale((s) => Math.max(MIN_SCALE, +(s - 0.1).toFixed(2)))}
            >
              A−
            </button>
            <button
              className="text-size-btn"
              aria-label="Larger text"
              onClick={() => setScale((s) => Math.min(MAX_SCALE, +(s + 0.1).toFixed(2)))}
            >
              A+
            </button>
          </span>
        </div>
        <span className={`role-badge ${step.role}`}>
          {step.role === 'all' ? 'All' : step.role === 'officiant' ? 'You (Officiant)' : step.role === 'reader' ? 'Reader' : ''}
        </span>
        <h2>{step.title}</h2>

        <StepBody step={step} bible={bible} />

        {step.note && <div className="muted-box" style={{ marginTop: 12 }}>{step.note}</div>}
      </div>

      <div className="run-controls">
        <button className="btn ghost small" onClick={() => go(-1)} disabled={index === 0}>
          ‹ Prev
        </button>
        {settings.ttsEnabled && step.text && (
          <button className="btn secondary small" onClick={toggleSpeak}>
            {speaking ? '◼ Stop' : '🔊 Read'}
          </button>
        )}
        <div style={{ flex: 1 }} />
        <button className="btn secondary small" onClick={() => go(1)}>
          Skip
        </button>
        <button className="btn small" onClick={() => go(1)}>
          {index === steps.length - 1 ? 'End ›' : 'Next ›'}
        </button>
      </div>
    </div>
  );
}

function StepBody({
  step,
  bible,
}: {
  step: RunStep;
  bible: ReturnType<typeof getBibleVersion>;
}) {
  switch (step.kind) {
    case 'reading':
    case 'psalm':
      return (
        <div>
          {step.text && <Liturgy className="spoken" text={step.text} />}
          <SourceNote step={step} />
          <ul className="refs">
            {(step.refs ?? []).map((ref, i) => (
              <li key={i}>
                <a className="link" href={bible?.url(ref)} target="_blank" rel="noreferrer">
                  {ref.label ? `${ref.label}: ` : ''}
                  {ref.book} {ref.passage}
                </a>
              </li>
            ))}
          </ul>
          {(step.refs ?? []).length === 0 && step.fallbackUrl && (
            <a className="link" href={step.fallbackUrl} target="_blank" rel="noreferrer">
              Open the lectionary for this date →
            </a>
          )}
        </div>
      );
    case 'hymn':
      return <HymnStep step={step} />;
    case 'collect':
      return (
        <div>
          {step.text ? (
            <Liturgy className="spoken" text={step.text} />
          ) : (
            <p className="subtle">Collect not catalogued offline.</p>
          )}
          <SourceNote step={step} />
          {step.fallbackUrl && (
            <a className="link" href={step.fallbackUrl} target="_blank" rel="noreferrer">
              View the authorised collect →
            </a>
          )}
        </div>
      );
    case 'sermon':
      return (
        <div>
          {step.address?.itemTitle || step.address?.resourceTitle ? (
            <div className="muted-box">
              Drawing on{' '}
              {step.address.itemTitle ? (
                <>
                  <strong>“{step.address.itemTitle}”</strong>
                  {step.address.resourceTitle ? ` — ${step.address.resourceTitle}` : ''}
                </>
              ) : (
                <strong>{step.address.resourceTitle}</strong>
              )}
              {step.address.resourceAuthor ? ` (${step.address.resourceAuthor})` : ''}
              {step.address.itemUrl && (
                <>
                  {' '}
                  <a className="link" href={step.address.itemUrl} target="_blank" rel="noreferrer">
                    Open ↗
                  </a>
                </>
              )}
            </div>
          ) : (
            <div className="muted-box">
              The address. Deliver your talk or play your chosen resource.
            </div>
          )}
          {step.address?.notes && (
            <p className="spoken" style={{ marginTop: 10, whiteSpace: 'pre-wrap' }}>
              {step.address.notes}
            </p>
          )}
        </div>
      );
    case 'prayers':
      return <PrayersStep />;
    default:
      return step.text ? (
        <>
          <Liturgy className="spoken" text={step.text} />
          <SourceNote step={step} />
        </>
      ) : (
        <p className="subtle">—</p>
      );
  }
}

/**
 * The intercessions: a classic structure for praying freely, plus prepared
 * BCP forms that expand on demand so the screen stays manageable.
 */
function PrayersStep() {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <div>
      <div className="muted-box">
        Pray in your own words — a classic shape:
        <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
          {INTERCESSION_PROMPTS.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </div>
      <p className="subtle" style={{ margin: '12px 0 6px' }}>
        Or use a prepared form:
      </p>
      {PREPARED_PRAYERS.map((p) => (
        <div key={p.id} className="card" style={{ padding: 12 }}>
          <div className="title-row">
            <div>
              <strong>{p.title}</strong>
              {p.occasion && <div className="subtle" style={{ fontSize: 12 }}>{p.occasion}</div>}
            </div>
            <button
              className="btn ghost small"
              onClick={() => setOpenId(openId === p.id ? null : p.id)}
            >
              {openId === p.id ? 'Hide' : 'Read'}
            </button>
          </div>
          {openId === p.id && (
            <>
              <p className="spoken" style={{ marginTop: 8 }}>
                {p.text}
              </p>
              <p className="verify-note">
                Source: {p.source}.{' '}
                {!p.verified && (
                  <span className="unverified">
                    ⚠ Hand-transcribed, not yet proofread — please check against a printed copy
                    before use.
                  </span>
                )}
              </p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Source credit and verification status for a step's text. Hand-transcribed
 * texts that haven't been proofread against a printed copy are clearly marked
 * so the leader can check them before the service.
 */
function SourceNote({ step }: { step: RunStep }) {
  if (!step.text || (!step.attribution && !step.unverified)) return null;
  return (
    <p className="verify-note">
      {step.attribution && <span>Source: {step.attribution}.</span>}{' '}
      {step.unverified && (
        <span className="unverified">
          ⚠ Hand-transcribed, not yet proofread — please check against a printed copy before use.
        </span>
      )}
    </p>
  );
}

function HymnStep({ step }: { step: RunStep }) {
  const choice = step.hymn;
  const hymn = choice ? getHymn(choice.hymnId) : undefined;
  const tune = hymn?.tunes.find((t) => t.id === choice?.tuneId);
  const midiUrl = tuneMidiUrl(tune);
  const playerRef = useRef<HTMLDivElement>(null);
  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    if (choice?.playMidi && midiUrl) {
      loadMidiPlayer().then(() => setPlayerReady(true)).catch(() => setPlayerReady(false));
    }
  }, [choice?.playMidi, midiUrl]);

  if (!choice || !hymn) {
    return <p className="subtle">No hymn chosen for this slot — sing one of your choice or skip.</p>;
  }

  return (
    <div>
      <p className="spoken" style={{ fontSize: 20 }}>
        {hymn.title}
      </p>
      <div className="subtle">
        Tune: {tune?.name ?? '—'} · {choice.verses} verse(s)
        {choice.includeChorus ? ' with chorus' : ''}
      </div>
      <div className="muted-box" style={{ marginTop: 10 }}>
        Order: {choice.order.join(' → ')}
      </div>
      {choice.playMidi && midiUrl ? (
        <div ref={playerRef} style={{ marginTop: 10 }}>
          {playerReady ? (
            <midi-player src={midiUrl} sound-font="" />
          ) : (
            <a className="link" href={midiUrl} target="_blank" rel="noreferrer">
              Open the MIDI for “{tune?.name}” →
            </a>
          )}
        </div>
      ) : (
        <p style={{ marginTop: 10 }}>
          <a className="link" href={listenUrl(tune, hymn.title)} target="_blank" rel="noreferrer">
            ♪ Hear the tune{tune?.name ? ` (${tune.name})` : ''} ↗
          </a>
        </p>
      )}
    </div>
  );
}
