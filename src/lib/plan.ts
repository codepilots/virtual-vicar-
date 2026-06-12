// Helpers to build a default ServicePlan and to resolve the ordered list of
// steps shown in run mode.

import { getLiturgicalDay, type LiturgicalDay } from '../data/calendar';
import { getService, type ServiceSection } from '../data/services';
import { getCollect, officialCollectUrl } from '../data/collects';
import { getReadings, officialLectionaryUrl, type ScriptureRef } from '../data/readings';
import { getPsalmText, GLORIA } from '../data/psalter';
import type { ServicePlan, Settings, HymnChoice } from './types';

/** Coverdale text for whichever bundled psalms a set of refs names. */
function offlinePsalmText(refs: ScriptureRef[]): string | undefined {
  const parts = refs
    .map((r) => getPsalmText(r))
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .map((p) => `Psalm ${p.number}\n\n${p.text}\n\n${GLORIA}`);
  return parts.length ? parts.join('\n\n') : undefined;
}

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
  /** Attribution line for fetched text (e.g. the Bible translation name). */
  attribution?: string;
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
  const collect = getCollect(day, service.tradition);

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
          // Fixed canticles (Venite etc.) carry their own text; an appointed
          // psalm slot is filled from the bundled Coverdale Psalter when whole.
          text: s.text ?? offlinePsalmText(psalmRefs),
          attribution: s.text ? undefined : offlinePsalmText(psalmRefs) ? 'Coverdale Psalter (BCP)' : undefined,
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

/**
 * Overlay readings fetched from an online lectionary onto run steps whose
 * slots the local table couldn't fill. Reading slots consume the non-psalm
 * refs in order; the psalmody slot (but not fixed canticles like the Venite)
 * receives the psalm refs.
 */
export function overlayLectionary(steps: RunStep[], refs: ScriptureRef[]): RunStep[] {
  if (refs.length === 0) return steps;
  const nonPsalm = refs.filter((r) => r.label !== 'Psalm');
  const psalms = refs.filter((r) => r.label === 'Psalm');
  let readingIdx = 0;
  return steps.map((s) => {
    if (s.kind === 'reading') {
      const idx = readingIdx;
      readingIdx += 1;
      if (s.refs && s.refs.length > 0) return s; // already filled locally
      const ref = nonPsalm[idx];
      return ref ? { ...s, refs: [ref] } : s;
    }
    const isPsalmody = /psalm/i.test(`${s.sectionId} ${s.title}`);
    if (s.kind === 'psalm' && isPsalmody && (!s.refs || s.refs.length === 0)) {
      const text = s.text ?? offlinePsalmText(psalms);
      return {
        ...s,
        refs: psalms,
        text,
        attribution: s.text ? s.attribution : text ? 'Coverdale Psalter (BCP)' : undefined,
      };
    }
    return s;
  });
}

// ---- Duration estimate ----

/** A rough seconds-per-step estimate, used for the service-length guide. */
function estimateStepSeconds(step: RunStep): number {
  switch (step.kind) {
    case 'hymn': {
      const verses = step.hymn?.order.length ?? step.hymn?.verses ?? 3;
      return verses * 35; // ~35s per verse/refrain sung
    }
    case 'reading':
      return 180; // a typical lesson
    case 'psalm':
      return step.text ? Math.max(60, wordCount(step.text) / 2) : 120;
    case 'sermon':
      return 8 * 60; // a short address
    case 'prayers':
      return 5 * 60;
    case 'rubric':
      return 0;
    default:
      return step.text ? Math.max(15, wordCount(step.text) / 2.5) : 20;
  }
}

function wordCount(text: string): number {
  return text.replace(/\[[^\]]*\]/g, '').trim().split(/\s+/).filter(Boolean).length;
}

/** Total estimated minutes for a run, and per-step seconds. */
export function estimateDuration(steps: RunStep[]): { totalMinutes: number; perStep: number[] } {
  const perStep = steps.map(estimateStepSeconds);
  const totalMinutes = Math.round(perStep.reduce((a, b) => a + b, 0) / 60);
  return { totalMinutes, perStep };
}
