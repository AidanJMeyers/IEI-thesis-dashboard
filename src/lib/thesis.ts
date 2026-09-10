import metadata from '@context/thesis-metadata.json';

/**
 * Static, non-editable facts about the thesis. These come from
 * `context/thesis-metadata.json` and are surfaced in headers, the study-context
 * page, and the committee view. Nothing here is user-editable, so it lives
 * outside the dashboard store.
 */

export const THESIS = metadata.thesis;
export const AIMS = metadata.aims;
export const CALENDAR = metadata.academic_calendar;
export const DEPENDENCIES = metadata.key_external_dependencies;

export const PLAN_START = '2026-08-31';
export const PLAN_END = '2027-05-01';

export const APP_NAME = 'Thesis Command Center';
export const APP_SUBTITLE = 'IEI Honors Thesis — Rollins College';

/** External documentation for the study this thesis is embedded in. */
export const BREATHE_CC_DOCS_URL = 'https://aidanjmeyers.github.io/breathe-cc-documentation/';
export const THESIS_REPO_URL = 'https://github.com/AidanJMeyers/IEI-thesis-dashboard';

export const STUDENT = THESIS.student;
export const COMMITTEE = THESIS.committee;
export const EXTERNAL_GUIDANCE = THESIS.external_guidance;

/**
 * Items that gate downstream work. The IRB modification for the Time-Activity
 * Supplement is the one true critical-path dependency: without it the IEI cannot
 * be time-weighted with participant-reported data, and its turnaround is
 * measured in weeks, not days.
 */
export interface CriticalPathItem {
  id: string;
  title: string;
  status: 'blocked' | 'in_progress' | 'not_started' | 'resolved';
  detail: string;
  blocks: string;
  target: string | null;
}

export const CRITICAL_PATH: CriticalPathItem[] = [
  {
    id: 'dd_reconciliation',
    title: 'Reconcile supplement fields against the production data dictionary',
    status: 'resolved',
    detail:
      'Done Sep 9, 2026. Of the 61 participant-facing items in the Aug 31 draft, 22 duplicate live production fields and 9 are obtainable from public records. The recommendation is a 10-item instrument — an 84% reduction — documented in two companion papers.',
    blocks: 'Nothing further. This is what unblocked the IRB package.',
    target: null,
  },
  {
    id: 'consent_language',
    title: 'Confirm approved consent covers geocoding beyond primary residence',
    status: 'not_started',
    detail:
      'Still the first task on the critical path. It now applies to geocoding already happening under the approved protocol rather than to anything the addition set introduces — so if the consent does not cover it, that is a live issue independent of this thesis.',
    blocks: 'IRB submission route and turnaround',
    target: '2026-09-13',
  },
  {
    id: 'irb_modification',
    title: 'IRB modification — IEI addition set',
    status: 'not_started',
    detail:
      'Ten participant-facing items, zero new HIPAA identifiers. The secondary-residence and school addresses expected to force a consent addendum are already collected and geocoded under the approved protocol, so this should be a minor modification (2–4 weeks) rather than an addendum (4–6).',
    blocks: 'Participant-reported time-weighting for the IEI (Aim 1)',
    target: '2026-09-20',
  },
  {
    id: 'spanish_translation',
    title: 'Spanish translation of the addition set',
    status: 'not_started',
    detail:
      'The BREATHE-CC cohort is bilingual; the translated items must be submitted alongside the English version, not after it. Ten items is roughly a day of translator time, against several days for the draft it replaces.',
    blocks: 'IRB submission completeness',
    target: '2026-09-20',
  },
  {
    id: 'campus_lookup',
    title: 'Build the campus bell-schedule lookup table',
    status: 'not_started',
    detail:
      'Eight districts cover the cohort. A campus-level table keyed on school_name removes three survey questions and beats parental recall on all three. Independent of the IRB, so it can be finished this week.',
    blocks: 'The school term of the time-weighting calculation',
    target: '2026-09-20',
  },
];

/**
 * Data-availability constraint, stated once and reused wherever the dashboard
 * shows progress. The committee needs to read this next to any result.
 */
export const DATA_CONSTRAINT =
  'The BREATHE-CC cohort is actively enrolling. Data collection is ongoing and will not be finalized before defense. All analyses use available data; the pipeline is built to be rerun on the finalized cohort post-thesis.';
