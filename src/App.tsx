import { useEffect, useMemo, useState } from 'react';
import { loadSettings, saveSettings, loadPlan, savePlan } from './lib/storage';
import { readPlanFromUrl } from './lib/share';
import type { Settings, ServicePlan } from './lib/types';
import { Home } from './components/Home';
import { SettingsScreen } from './components/SettingsScreen';
import { Wizard } from './components/Wizard';
import { RunMode } from './components/RunMode';
import { PrintSheet } from './components/PrintSheet';

type Screen =
  | { name: 'home' }
  | { name: 'settings' }
  | { name: 'wizard' }
  | { name: 'run' }
  | { name: 'print' };

const TITLES: Record<Screen['name'], string> = {
  home: 'Virtual Vicar',
  settings: 'Settings',
  wizard: 'Plan a Service',
  run: 'Leading the Service',
  print: 'Order of Service',
};

export function App() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  // A plan shared via URL hash takes precedence over the last saved plan.
  const [plan, setPlan] = useState<ServicePlan | null>(() => readPlanFromUrl() ?? loadPlan());
  const [screen, setScreen] = useState<Screen>({ name: 'home' });

  useEffect(() => saveSettings(settings), [settings]);
  useEffect(() => savePlan(plan), [plan]);

  const canRun = useMemo(() => plan !== null, [plan]);

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="topbar">
        {screen.name !== 'home' && (
          <button className="back" onClick={() => setScreen({ name: 'home' })} aria-label="Back">
            ‹ Home
          </button>
        )}
        <h1>{TITLES[screen.name]}</h1>
        <div className="spacer" />
        {screen.name === 'home' && (
          <button className="back" onClick={() => setScreen({ name: 'settings' })}>
            Settings
          </button>
        )}
      </header>

      <main id="main">
        {screen.name === 'home' && (
          <Home
            settings={settings}
            plan={plan}
            canRun={canRun}
            onPlan={() => setScreen({ name: 'wizard' })}
            onRun={() => setScreen({ name: 'run' })}
            onPrint={() => setScreen({ name: 'print' })}
            onSettings={() => setScreen({ name: 'settings' })}
            onImportPlan={(p) => setPlan(p)}
          />
        )}
        {screen.name === 'settings' && (
          <SettingsScreen settings={settings} onChange={setSettings} />
        )}
        {screen.name === 'wizard' && (
          <Wizard
            settings={settings}
            initialPlan={plan}
            // Keep the app's plan (and localStorage) in step with edits so
            // leaving the wizard via "‹ Home" never loses work.
            onChange={(p) => setPlan(p)}
            onComplete={(p) => {
              setPlan(p);
              setScreen({ name: 'run' });
            }}
            onPrint={(p) => {
              setPlan(p);
              setScreen({ name: 'print' });
            }}
            onCancel={() => setScreen({ name: 'home' })}
          />
        )}
        {screen.name === 'run' && plan && (
          <RunMode plan={plan} settings={settings} onExit={() => setScreen({ name: 'home' })} />
        )}
        {screen.name === 'print' && plan && (
          <PrintSheet plan={plan} settings={settings} onBack={() => setScreen({ name: 'home' })} />
        )}
      </main>

      <div className="footer-note">
        For lay-led offices only (Morning Prayer, Prayer During the Day, Evening Prayer, Night
        Prayer and A Service of the Word). Always check your incumbent’s guidance. Liturgical texts
        © their respective owners;
        bundled public-domain texts are hand-transcribed and unchecked items are marked ⚠ — see
        Settings → About &amp; sources.
      </div>
    </div>
  );
}
