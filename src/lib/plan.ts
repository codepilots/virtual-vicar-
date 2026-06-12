// Helpers to build a default ServicePlan and to resolve the ordered list of
// steps shown in run mode.

import { getLiturgicalDay, type LiturgicalDay } from '../data/calendar';
import { getService, type ServiceSection } from '../data/services';
import { getCollect, officialCollectUrl } from '../data/collects';
import { getReadings, officialLectionaryUrl, type ScriptureRef } from '../data/readings';
import type { ServicePlan, Settings, HymnChoice } from './types';

export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function dayFromIso(iso: string): LiturgicalDay {
  const [y, m, d] = iso.split('-').map(Number);
  return getLiturgicalDay(new Date(y, (m ?? 1) - 1, d ?? 1));
}

/** Build a fresh plan for a service with optional sections set to their default. */
export function defaultPlan(serviceId: string, dateIso: string): ServicePlan {
  const service = getService(serviceId);
  const includedSections: Record<string, boolean> = {};
  for (const s of service?.sections ?? []) {
    if (s.optional) includedSections[s.id] = s.defaultOn ?? true;
  }
  return {
    serviceId,
    dateIso,
    includedSections,
    hymns: [],
    address: { resourceId: null },
  };
}

export function isSectionIncluded(plan: ServicePlan, section: ServiceSection): boolean {
  if (!section.optional) return true;
  return plan.includedSections[section.id] ?? section.defaultOn ?? true;
}

export function hymnForSection(plan: ServicePlan, sectionId: string): HymnChoice | undefined {
  return plan.hymns.find((h) => h.sectionId === sectionId);
}

// ---- Run steps ----

export type RunStepKind =
  | 'said'
  | 'rubric'
  | 'reading'
  | 'psalm'
  | 'hymn'
  | 'sermon'
  | 'prayers'
  | 'collect'
  | 'responsive';

export interface RunStep {
  sectionId: string;
  title: string;
  kind: RunStepKind;
  role: ServiceSection['role'];
  /** Spoken/printed text where present. */
  text?: string;
  note?: string;
  /** For reading/psalm steps: the scripture references to show with links. */
  refs?: ScriptureRef[];
  /** For collect steps: a fallback URL if no text is catalogued. */
  fallbackUrl?: string;
  /** For hymn steps: the chosen hymn for this section. */
  hymn?: HymnChoice;
}

/**
 * Resolve the ordered run steps for a plan, filling reading/collect slots from
 * the lectionary and dropping any optional section the user excluded.
 */
export function buildRunSteps(plan: ServicePlan, _settings: Settings): RunStep[] {
  const service = getService(plan.serviceId);
  if (!service) return [];
  const day = dayFromIso(plan.dateIso);
  const readings = getReadings(day);
  const collect = getCollect(day);

  // Distribute available readings across reading slots in order.
  const refList = readings?.principal ?? [];
  const nonPsalmRefs = refList.filter((r) => r.label !== 'Psalm');
  const psalmRefs = refList.filter((r) => r.label === 'Psalm');

  const steps: RunStep[] = [];
  let readingIdx = 0;

  for (const s of service.sections) {
    if (!isSectionIncluded(plan, s)) continue;
    const base = { sectionId: s.id, title: s.title, role: s.role, note: s.note };

    switch (s.kind) {
      case 'reading': {
        const ref = nonPsalmRefs[readingIdx];
        readingIdx += 1;
        steps.push({
          ...base,
          kind: 'reading',
          refs: ref ? [ref] : [],
          fallbackUrl: officialLectionaryUrl(day),
        });
        break;
      }
      case 'psalm':
        steps.push({
          ...base,
          kind: 'psalm',
          refs: psalmRefs,
          text: s.text,
          fallbackUrl: officialLectionaryUrl(day),
        });
        break;
      case 'collect':
        steps.push({
          ...base,
          kind: 'collect',
          text: collect?.collect,
          fallbackUrl: officialCollectUrl(day),
        });
        break;
      case 'hymn':
        steps.push({ ...base, kind: 'hymn', hymn: hymnForSection(plan, s.id) });
        break;
      case 'sermon':
        steps.push({ ...base, kind: 'sermon', text: s.text });
        break;
      case 'prayers':
        steps.push({ ...base, kind: 'prayers', text: s.text });
        break;
      case 'responsive':
        steps.push({ ...base, kind: 'responsive', text: s.text });
        break;
      case 'rubric':
        steps.push({ ...base, kind: 'rubric', text: s.text });
        break;
      case 'said':
      default:
        steps.push({ ...base, kind: 'said', text: s.text });
        break;
    }
  }
  return steps;
}
