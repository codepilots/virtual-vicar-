// Thin, typed wrapper over localStorage for persisting settings and the most
// recent service plan. All access is defensive so the app still runs if storage
// is unavailable (e.g. private browsing).

import { DEFAULT_SETTINGS, type Settings, type ServicePlan } from './types';

const SETTINGS_KEY = 'vv.settings.v1';
const PLAN_KEY = 'vv.plan.v1';
const SECTION_PREFS_KEY = 'vv.sectionPrefs.v1';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...(JSON.parse(raw) as object) } as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota / unavailable storage */
  }
}

export function loadSettings(): Settings {
  return read<Settings>(SETTINGS_KEY, DEFAULT_SETTINGS);
}

export function saveSettings(settings: Settings): void {
  write(SETTINGS_KEY, settings);
}

export function loadPlan(): ServicePlan | null {
  try {
    const raw = localStorage.getItem(PLAN_KEY);
    return raw ? (JSON.parse(raw) as ServicePlan) : null;
  } catch {
    return null;
  }
}

export function savePlan(plan: ServicePlan | null): void {
  if (plan === null) {
    try {
      localStorage.removeItem(PLAN_KEY);
    } catch {
      /* ignore */
    }
    return;
  }
  write(PLAN_KEY, plan);
}

// The user's last on/off choices for a service's optional sections, keyed by
// service id. Used as the starting point next time that service is prepared
// (a fresh service with no saved choices starts with everything off).

type SectionPrefs = Record<string, Record<string, boolean>>;

export function loadSectionPrefs(serviceId: string): Record<string, boolean> {
  return read<SectionPrefs>(SECTION_PREFS_KEY, {})[serviceId] ?? {};
}

export function saveSectionPrefs(serviceId: string, sections: Record<string, boolean>): void {
  const all = read<SectionPrefs>(SECTION_PREFS_KEY, {});
  write(SECTION_PREFS_KEY, { ...all, [serviceId]: sections });
}
