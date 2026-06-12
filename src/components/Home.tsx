import { useMemo } from 'react';
import type { Settings, ServicePlan } from '../lib/types';
import { dayFromIso, todayIso } from '../lib/plan';
import { getService } from '../data/services';
import { DayBanner } from './DayBanner';

interface Props {
  settings: Settings;
  plan: ServicePlan | null;
  canRun: boolean;
  onPlan: () => void;
  onRun: () => void;
  onSettings: () => void;
}

export function Home({ settings, plan, canRun, onPlan, onRun }: Props) {
  const today = useMemo(() => dayFromIso(todayIso()), []);
  const planService = plan ? getService(plan.serviceId) : undefined;

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
