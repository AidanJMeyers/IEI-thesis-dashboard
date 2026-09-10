import evaluationCriteria from '@context/evaluation-criteria.json';
import weeklyPlan from '@context/weekly-plan.json';
import type {
  ActivityEntry,
  DashboardState,
  EvaluationComponent,
  Meeting,
  Note,
  Priority,
  ResourceLink,
  StoredFile,
  Task,
  Week,
} from '@/lib/types';
import { BREATHE_CC_DOCS_URL, THESIS_REPO_URL } from '@/lib/thesis';
import { DELIVERABLE_DOCS } from '@/lib/study';
import { toISODate, today } from '@/lib/utils';

/**
 * Builds the initial dashboard state from the JSON context files. The same
 * function feeds the browser's local mode and `scripts/seed.ts`, so the two
 * backends always start from identical data.
 *
 * Every id here is deterministic (`w3-t2`, not a random UUID) so that re-seeding
 * is idempotent and a task keeps its identity across reloads.
 */

const SEED_TIMESTAMP = '2026-08-31T09:00:00.000Z';

type RawWeek = (typeof weeklyPlan.weeks)[number];

function buildComponents(): EvaluationComponent[] {
  const out: EvaluationComponent[] = [];
  const semesters = [
    { key: 'fall_2026' as const, data: evaluationCriteria.fall_2026 },
    { key: 'spring_2027' as const, data: evaluationCriteria.spring_2027 },
  ];

  for (const { key, data } of semesters) {
    data.components.forEach((c, i) => {
      // `evaluation-criteria.json` uses "ongoing" for the participation
      // components; the schema only knows the four lifecycle states.
      const status = c.status === 'ongoing' ? 'in_progress' : 'not_started';
      out.push({
        id: c.id,
        semester: key,
        name: c.name,
        weight: c.weight,
        description: c.description ?? null,
        due_date: c.due_date ?? null,
        status,
        grade_notes: null,
        sort_order: i,
      });
    });
  }
  return out;
}

function buildWeeks(): Week[] {
  return (weeklyPlan.weeks as RawWeek[]).map((w) => ({
    id: w.week,
    week_number: w.week,
    start_date: w.start,
    end_date: w.end,
    phase: w.phase,
    title: w.title,
    has_meeting: Boolean(w.meeting),
    meeting_agenda: w.meeting_agenda ?? null,
    meeting_notes: null,
    meeting_action_items: null,
    key_decisions: (w.key_decisions ?? []) as string[],
    deliverables: (w.deliverables ?? []) as string[],
    is_current: false,
  }));
}

/**
 * Work already finished before the dashboard existed. The Time-Activity
 * Supplement and its design memo were drafted on Aug 31, 2026 — the plan file
 * does not list them because they predate it, but they belong in Week 1 so the
 * committee sees an accurate starting position rather than a blank slate.
 */
const PRE_COMPLETED: Array<{
  week: number;
  title: string;
  description: string;
  component: string | null;
  priority: Priority;
  completedAt: string;
}> = [
  {
    week: 1,
    title: 'Draft Time-Activity Supplement REDCap instrument (75 fields, ta_ prefix)',
    description:
      'Captures multi-residence status, school address, weekday/weekend time-activity budgets, AC type and window behavior, transit mode, and outdoor activity timing. Delivered as BREATHE-CC_TimeActivity_Supplement_DataDictionary.csv.',
    component: 'fall_pipeline',
    priority: 'critical',
    completedAt: '2026-08-31T09:00:00.000Z',
  },
  {
    week: 1,
    title: 'Write IEI Time-Activity Instrument design memo',
    description:
      'Methodological justification for each field group, flags fields that may duplicate existing baseline items, and sets out the data-security framing for address collection.',
    component: 'fall_pipeline',
    priority: 'high',
    completedAt: '2026-08-31T09:00:00.000Z',
  },
  {
    week: 2,
    title: 'Produce the IEI field inventory and minimal addition set',
    description:
      'Two committee-ready documents: a full reconciliation of the Aug 31 draft against the production dictionary (22 duplicates, 9 externally derivable), and the resulting 10-item instrument rendered as a sample form with an item-by-item justification table.',
    component: 'fall_pipeline',
    priority: 'critical',
    completedAt: '2026-09-09T17:00:00.000Z',
  },
];

/**
 * Plan tasks that are already finished. Keyed by the deterministic id so the
 * mapping survives any re-ordering of the plan file.
 *   w1-t2  Export BREATHE-CC data dictionary from REDCap production
 *   w1-t3  Reconcile Time-Activity Supplement fields against the data dictionary
 *   w1-t7  Set up this thesis dashboard
 */
const COMPLETED_PLAN_TASKS: Record<string, string> = {
  'w1-t2': '2026-08-25T12:00:00.000Z',
  'w1-t3': '2026-09-09T17:00:00.000Z',
  'w1-t7': SEED_TIMESTAMP,
};

function buildTasks(weeks: Week[]): Task[] {
  const tasks: Task[] = [];

  for (const week of weeks) {
    const raw = (weeklyPlan.weeks as RawWeek[]).find((w) => w.week === week.week_number);
    if (!raw) continue;

    raw.tasks.forEach((t, i) => {
      const id = `w${week.week_number}-t${i + 1}`;
      const completedAt = COMPLETED_PLAN_TASKS[id];
      tasks.push({
        id,
        week_id: week.id,
        evaluation_component_id: t.component ?? null,
        title: t.task,
        description: null,
        priority: (t.priority as Priority) ?? 'medium',
        status: completedAt ? 'done' : 'todo',
        due_date: week.end_date,
        completed_at: completedAt ?? null,
        sort_order: i,
        created_at: SEED_TIMESTAMP,
        updated_at: SEED_TIMESTAMP,
      });
    });
  }

  PRE_COMPLETED.forEach((t, i) => {
    const week = weeks.find((w) => w.week_number === t.week);
    tasks.push({
      id: `w${t.week}-pre${i + 1}`,
      week_id: week?.id ?? t.week,
      evaluation_component_id: t.component,
      title: t.title,
      description: t.description,
      priority: t.priority,
      status: 'done',
      due_date: week?.end_date ?? null,
      completed_at: t.completedAt,
      sort_order: 100 + i,
      created_at: SEED_TIMESTAMP,
      updated_at: t.completedAt,
    });
  });

  return tasks;
}

/**
 * Deliverables that ship with the app rather than being uploaded. They live in
 * /public/deliverables and open in both local and Supabase mode.
 */
function buildFiles(): StoredFile[] {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return DELIVERABLE_DOCS.map((doc) => ({
    id: doc.id,
    task_id: null,
    evaluation_component_id: 'fall_pipeline',
    file_name: doc.title + '.docx',
    file_path: `deliverables/${doc.file}`,
    file_size: doc.bytes,
    file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    uploaded_by: null,
    uploaded_at: '2026-09-09T17:00:00.000Z',
    local_data_url: null,
    public_url: `${base}/deliverables/${doc.file}`,
  }));
}

/**
 * One meeting record per planned meeting week, agenda pre-populated from the
 * plan. Seeding the whole schedule (rather than only past meetings) means the
 * agenda is already waiting when each Monday arrives.
 */
function buildMeetings(weeks: Week[]): Meeting[] {
  return weeks
    .filter((w) => w.has_meeting)
    .map((w) => ({
      id: `meeting-w${w.week_number}`,
      week_id: w.id,
      // Meeting weeks start on Monday; the standing slot is Monday 2:30 PM.
      date: w.start_date,
      attendees: ['Aidan Meyers', 'Dr. Shan-Estelle Brown'],
      agenda: w.meeting_agenda,
      notes: null,
      action_items: [],
      created_at: SEED_TIMESTAMP,
    }));
}

function buildLinks(): ResourceLink[] {
  return [
    {
      id: 'link-breathecc-docs',
      task_id: null,
      evaluation_component_id: null,
      title: 'BREATHE-CC Documentation Dashboard',
      url: BREATHE_CC_DOCS_URL,
      link_type: 'document',
      created_at: SEED_TIMESTAMP,
    },
    {
      id: 'link-thesis-repo',
      task_id: null,
      evaluation_component_id: 'fall_pipeline',
      title: 'Thesis Command Center — GitHub repository',
      url: THESIS_REPO_URL,
      link_type: 'github',
      created_at: SEED_TIMESTAMP,
    },
  ];
}

function buildNotes(): Note[] {
  return [
    {
      id: 'note-critical-path',
      week_id: 1,
      title: 'Critical path: IRB modification',
      content:
        'Updated Sep 9, 2026. The addition set introduces no new HIPAA identifiers: the secondary-residence address is already live and flagged Identifier = Y in secondary_household_details, and the school address is already geocoded in geocode_derived_variables via API import. That should make this a minor modification (2–4 weeks) rather than a consent addendum (4–6). Confirming the approved consent covers geocoding is still the first task — but it now applies to geocoding already happening, not to anything this instrument adds.',
      is_pinned: true,
      created_at: SEED_TIMESTAMP,
      updated_at: '2026-09-09T17:00:00.000Z',
    },
    {
      id: 'note-reconciliation',
      week_id: 2,
      title: '61 items became 10 — say this in the meeting',
      content:
        'Of the 61 participant-facing items in the Aug 31 draft, 22 duplicate live production fields, 9 are obtainable from public records at better accuracy than parental recall, 12 were out of scope for an exposure index, and the 12-field hour grid compressed into 3 banded items plus a subtraction. The recommendation is 10 items, median 7 seen after branching, about 90 seconds to complete. The instrument going to the IRB is smaller, less granular and less identifying than the one described in the proposal.',
      is_pinned: true,
      created_at: '2026-09-09T17:00:00.000Z',
      updated_at: '2026-09-09T17:00:00.000Z',
    },
    {
      id: 'note-data-constraint',
      week_id: 1,
      title: 'Data availability constraint (say this in every committee meeting)',
      content:
        'BREATHE-CC is still enrolling. The final dataset will not exist before defense. Aim 2 delivers a reproducible, documented pipeline validated on available data — not final effect estimates. Framing this as a deliberate design choice rather than a shortfall is the difference between a limitation and a contribution.',
      is_pinned: true,
      created_at: SEED_TIMESTAMP,
      updated_at: SEED_TIMESTAMP,
    },
    {
      id: 'note-iei-fallback',
      week_id: 1,
      title: 'IEI must accept two time-activity sources',
      content:
        'Build the time-weighting module to take either literature-based defaults or participant-reported budgets. If IRB approval lands late, the pipeline still runs on defaults and the manuscript reports both. This is the insurance policy against the IRB timeline.',
      is_pinned: false,
      created_at: SEED_TIMESTAMP,
      updated_at: SEED_TIMESTAMP,
    },
  ];
}

function buildActivity(): ActivityEntry[] {
  return [
    {
      id: 'act-seed-6',
      user_id: null,
      action: 'file_uploaded',
      entity_type: 'file',
      entity_id: 'doc-sample-form',
      details: 'Added the sample form and item justification',
      created_at: '2026-09-09T17:05:00.000Z',
    },
    {
      id: 'act-seed-5',
      user_id: null,
      action: 'file_uploaded',
      entity_type: 'file',
      entity_id: 'doc-field-inventory',
      details: 'Added the IEI field inventory and minimal addition set',
      created_at: '2026-09-09T17:04:00.000Z',
    },
    {
      id: 'act-seed-4',
      user_id: null,
      action: 'task_completed',
      entity_type: 'task',
      entity_id: 'w1-t3',
      details: 'Reconciled the supplement against the production dictionary — 22 duplicates found',
      created_at: '2026-09-09T17:00:00.000Z',
    },
    {
      id: 'act-seed-3',
      user_id: null,
      action: 'task_completed',
      entity_type: 'task',
      entity_id: 'w1-pre1',
      details: 'Drafted the 74-field Time-Activity Supplement REDCap instrument',
      created_at: SEED_TIMESTAMP,
    },
    {
      id: 'act-seed-2',
      user_id: null,
      action: 'task_completed',
      entity_type: 'task',
      entity_id: 'w1-pre2',
      details: 'Wrote the IEI Time-Activity Instrument design memo',
      created_at: SEED_TIMESTAMP,
    },
    {
      id: 'act-seed-1',
      user_id: null,
      action: 'note_created',
      entity_type: 'note',
      entity_id: 'note-critical-path',
      details: 'Pinned the IRB modification as the fall critical path',
      created_at: SEED_TIMESTAMP,
    },
  ];
}

export function buildSeedState(): DashboardState {
  const weeks = markCurrentWeek(buildWeeks());
  return {
    components: buildComponents(),
    weeks,
    tasks: buildTasks(weeks),
    files: buildFiles(),
    links: buildLinks(),
    meetings: buildMeetings(weeks),
    activity: buildActivity(),
    notes: buildNotes(),
  };
}

/**
 * Folds newly-shipped seed rows into a state that was saved before the update.
 *
 * A release can add deliverables, notes or tasks that an existing browser has
 * never seen. Rows are matched by id and only genuinely new ones are added, so
 * anything already edited, completed or annotated is left exactly as it was —
 * the cost of that rule is that a seeded row the user deleted will come back.
 */
export function mergeNewSeedRows(stored: DashboardState): DashboardState {
  const fresh = buildSeedState();

  const addMissing = <T extends { id: string | number }>(existing: T[], incoming: T[]): T[] => {
    const seen = new Set(existing.map((x) => String(x.id)));
    const additions = incoming.filter((x) => !seen.has(String(x.id)));
    return additions.length ? [...existing, ...additions] : existing;
  };

  const activity = addMissing(stored.activity, fresh.activity)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 100);

  return {
    ...stored,
    components: addMissing(stored.components, fresh.components),
    weeks: markCurrentWeek(stored.weeks.length ? stored.weeks : fresh.weeks),
    tasks: addMissing(stored.tasks, fresh.tasks),
    files: addMissing(stored.files, fresh.files),
    links: addMissing(stored.links, fresh.links),
    meetings: addMissing(stored.meetings, fresh.meetings),
    notes: addMissing(stored.notes, fresh.notes),
    activity,
  };
}

/**
 * Marks whichever week contains today. Before the plan starts, the first week is
 * current; after it ends, the last one is. Recomputed on every load rather than
 * stored, so the dashboard is never stale.
 */
export function markCurrentWeek(weeks: Week[]): Week[] {
  const now = toISODate(today());
  let currentId: number | null = null;

  for (const w of weeks) {
    if (now >= w.start_date && now <= w.end_date) {
      currentId = w.id;
      break;
    }
  }
  if (currentId === null && weeks.length) {
    const sorted = [...weeks].sort((a, b) => a.week_number - b.week_number);
    // Gaps exist between weeks (e.g. the Dec 4 → Dec 7 finals gap). Fall forward
    // to the next upcoming week so the dashboard never shows nothing.
    const next = sorted.find((w) => w.start_date > now);
    currentId = next ? next.id : sorted[sorted.length - 1].id;
    if (now < sorted[0].start_date) currentId = sorted[0].id;
  }

  return weeks.map((w) => ({ ...w, is_current: w.id === currentId }));
}

export const SEED_VERSION = 3;
