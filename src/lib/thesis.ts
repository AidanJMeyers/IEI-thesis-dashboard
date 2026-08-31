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
    id: 'irb_modification',
    title: 'IRB modification — Time-Activity Supplement',
    status: 'not_started',
    detail:
      'Instrument drafted (74 fields) but not submitted. School and secondary-residence addresses are HIPAA identifiers, so this may require a consent addendum (4–6 weeks) rather than a simple modification (2–4 weeks).',
    blocks: 'Participant-reported time-weighting for the IEI (Aim 1)',
    target: '2026-09-20',
  },
  {
    id: 'consent_language',
    title: 'Confirm approved consent covers geocoding beyond primary residence',
    status: 'not_started',
    detail:
      'Determines whether the submission is a modification or a full consent addendum. This single answer sets the IRB timeline.',
    blocks: 'IRB submission route and turnaround',
    target: '2026-09-06',
  },
  {
    id: 'spanish_translation',
    title: 'Spanish translation of the supplement',
    status: 'not_started',
    detail:
      'The BREATHE-CC cohort is bilingual; the translated instrument must be submitted alongside the English version, not after it.',
    blocks: 'IRB submission completeness',
    target: '2026-09-20',
  },
  {
    id: 'dd_reconciliation',
    title: 'Reconcile supplement fields against the production data dictionary',
    status: 'not_started',
    detail:
      'Gas cooking, secondhand smoke, and mold/dampness likely already exist at baseline. Duplicates must be removed before the import file goes to IRB.',
    blocks: 'IRB package and the indoor-exposure scoring module',
    target: '2026-09-06',
  },
];

/**
 * Data-availability constraint, stated once and reused wherever the dashboard
 * shows progress. The committee needs to read this next to any result.
 */
export const DATA_CONSTRAINT =
  'The BREATHE-CC cohort is actively enrolling. Data collection is ongoing and will not be finalized before defense. All analyses use available data; the pipeline is built to be rerun on the finalized cohort post-thesis.';
