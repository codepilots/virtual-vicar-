import { useMemo, useRef, useState } from 'react';
import type { Settings, ServicePlan } from '../lib/types';
import { dayFromIso, todayIso } from '../lib/plan';
import { getService } from '../data/services';
import { sharePlan, downloadPlan, importPlanFile } from '../lib/share';
import { DayBanner } from './DayBanner';

interface Props {
  settings: Settings;
  plan: ServicePlan | null;
  canRun: boolean;
  onPlan: () => void;
  onRun: () => void;
  onPrint: () => void;
  onSettings: () => void;
  onImportPlan: (plan: ServicePlan) => void;
}

export function Home({ settings, plan, canRun, onPlan, onRun, onPrint, onImportPlan }: Props) {
  const today = useMemo(() => dayFromIso(todayIso()), []);
  const planService = plan ? getService(plan.serviceId) : undefined;
  const fileInput = useRef<HTMLInputElement>(null);
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  const doShare = async () => {
    if (!plan) return;
    const result = await sharePlan(plan);
    setShareMsg(
      result === 'shared' ? 'Shared.' : result === 'copied' ? 'Link copied to clipboard.' : 'Could not share.',
    );
    setTimeout(() => setShareMsg(null), 2500);
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const imported = await importPlanFile(file);
    setShareMsg(imported ? 'Plan imported.' : 'That file wasn’t a valid plan.');
    if (imported) onImportPlan(imported);
    setTimeout(() => setShareMsg(null), 2500);
  };

  return (
    <div>
      <DayBanner day={today} />

      <p className="subtle" style={{ marginTop: -4 }}>
        Welcome. I’ll help you prepare and lead a service — the readings, the collect, hymns and a
        step-by-step guide you can follow on the day, with an optional spoken voice.
      </p>

      <button className="btn" onClick={onPlan} style={{ marginTop: 8 }}>
        ✛ Plan a service
      </button>

      {plan && planService && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="title-row">
            <div>
              <h3>Resume your plan</h3>
              <div className="subtle">
                {planService.name} · {dayFromIso(plan.dateIso).name}
              </div>
            </div>
          </div>
          <div className="btn-row">
            <button className="btn" onClick={onRun} disabled={!canRun}>
              ▶ Begin service
            </button>
            <button className="btn secondary" onClick={onPlan}>
              Edit
            </button>
          </div>
          <div className="btn-row">
            <button className="btn ghost small" onClick={onPrint}>
              ⎙ Print
            </button>
            <button className="btn ghost small" onClick={doShare}>
              ⇪ Share
            </button>
            <button className="btn ghost small" onClick={() => downloadPlan(plan)}>
              ⬇ Save file
            </button>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: 16 }}>
        <div className="title-row">
          <h3>Restore a plan</h3>
          <button className="btn secondary small" onClick={() => fileInput.current?.click()}>
            Import file
          </button>
        </div>
        <div className="subtle">Open a plan a colleague shared, or a backup you saved.</div>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          onChange={onFile}
          style={{ display: 'none' }}
        />
      </div>

      {shareMsg && (
        <div className="muted-box" style={{ marginTop: 12 }}>
          {shareMsg}
        </div>
      )}

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Your defaults</h3>
        <div className="subtle">
          Bible: {settings.bibleVersionId.toUpperCase()} · Hymn books:{' '}
          {settings.ownedHymnBookIds.length || 'none set'} · Congregation:{' '}
          {settings.congregation ?? 'any'} · Voice: {settings.ttsEnabled ? 'on' : 'off'}
        </div>
      </div>
    </div>
  );
}
