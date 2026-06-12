import { useEffect, useMemo, useRef, useState } from 'react';
import type { Settings, ServicePlan } from '../lib/types';
import { buildRunSteps, dayFromIso, overlayLectionary, type RunStep } from '../lib/plan';
import { getBibleVersion } from '../data/bibleVersions';
import { getHymn } from '../data/hymns';
import { speak, cancelSpeech } from '../lib/tts';
import { loadMidiPlayer } from '../lib/midi';
import { useDayReadings, usePassageText } from '../lib/api/hooks';

interface Props {
  plan: ServicePlan;
  settings: Settings;
  onExit: () => void;
}

export function RunMode({ plan, settings, onExit }: Props) {
  const baseSteps = useMemo(() => buildRunSteps(plan, settings), [plan, settings]);
  const day = useMemo(() => dayFromIso(plan.dateIso), [plan.dateIso]);
  const bible = getBibleVersion(settings.bibleVersionId);
  const [index, setIndex] = useState(0);
  const [speaking, setSpeaking] = useState(false);

  // Fill reading/psalm slots from the online lectionary where the local table
  // had nothing; offline this is a no-op and the official-lectionary links stay.
  const lectionary = useDayReadings(plan.dateIso, settings.useOnlineSources);
  const steps = useMemo(
    () => overlayLectionary(baseSteps, lectionary.refs),
    [baseSteps, lectionary.refs],
  );

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
      ? { ...rawStep, text: passage.text, attribution: passage.translationName }
      : rawStep;

  // Auto-read officiant text when enabled and the step changes.
  useEffect(() => {
    cancelSpeech();
    setSpeaking(false);
    if (!step || !settings.ttsEnabled) return;
    const shouldSpeak =
      step.text && (step.role === 'officiant' || step.kind === 'collect' || step.kind === 'responsive');
    if (shouldSpeak && step.text) {
      setSpeaking(true);
      speak(step.text, {
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
      speak(step.text, {
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
    <div className="run">
      <div className="run-step">
        <div className="run-progress">
          Step {index + 1} of {steps.length} · {day.name}
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
          {step.text && <p className="spoken">{step.text}</p>}
          {step.attribution && (
            <p className="subtle" style={{ fontSize: 12 }}>
              {step.attribution} · via bible-api.com
            </p>
          )}
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
            <p className="spoken">{step.text}</p>
          ) : (
            <p className="subtle">Collect not catalogued offline.</p>
          )}
          {step.fallbackUrl && (
            <a className="link" href={step.fallbackUrl} target="_blank" rel="noreferrer">
              View the authorised collect →
            </a>
          )}
        </div>
      );
    case 'sermon':
      return (
        <div className="muted-box">
          The address. Deliver your talk or play your chosen resource. Use the plan’s notes as your
          outline.
        </div>
      );
    case 'prayers':
      return (
        <div className="muted-box">
          Lead the intercessions — for the Church, the world, the local community, the sick and the
          departed — in your own words, or use a prepared form.
        </div>
      );
    default:
      return step.text ? (
        <p className="spoken">{step.text}</p>
      ) : (
        <p className="subtle">—</p>
      );
  }
}

function HymnStep({ step }: { step: RunStep }) {
  const choice = step.hymn;
  const hymn = choice ? getHymn(choice.hymnId) : undefined;
  const tune = hymn?.tunes.find((t) => t.id === choice?.tuneId);
  const playerRef = useRef<HTMLDivElement>(null);
  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    if (choice?.playMidi && tune?.midiUrl) {
      loadMidiPlayer().then(() => setPlayerReady(true)).catch(() => setPlayerReady(false));
    }
  }, [choice?.playMidi, tune?.midiUrl]);

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
      {choice.playMidi && tune?.midiUrl ? (
        <div ref={playerRef} style={{ marginTop: 10 }}>
          {playerReady ? (
            <midi-player src={tune.midiUrl} sound-font="" />
          ) : (
            <a className="link" href={tune.midiUrl} target="_blank" rel="noreferrer">
              Open the MIDI for “{tune.name}” →
            </a>
          )}
        </div>
      ) : (
        <p className="subtle" style={{ marginTop: 8 }}>
          MIDI playback off for this hymn.
        </p>
      )}
    </div>
  );
}
