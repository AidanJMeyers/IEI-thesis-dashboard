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
  Task,
  Week,
} from '@/lib/types';
import { BREATHE_CC_DOCS_URL, THESIS_REPO_URL } from '@/lib/thesis';
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
const PRE_COMPLETED_WEEK_1: Array<{
  title: string;
  description: string;
  component: string | null;
  priority: Priority;
}> = [
  {
    title: 'Draft Time-Activity Supplement REDCap instrument (75 fields, ta_ prefix)',
    description:
      'Captures multi-residence status, school address, weekday/weekend time-activity budgets, AC type and window behavior, transit mode, and outdoor activity timing. Delivered as BREATHE-CC_TimeActivity_Supplement_DataDictionary.csv.',
    component: 'fall_pipeline',
    priority: 'critical',
  },
  {
    title: 'Write IEI Time-Activity Instrument design memo',
    description:
      'Methodological justification for each field group, flags fields that may duplicate existing baseline items, and sets out the data-security framing for address collection.',
    component: 'fall_pipeline',
    priority: 'high',
  },
];

function buildTasks(weeks: Week[]): Task[] {
  const tasks: Task[] = [];

  for (const week of weeks) {
    const raw = (weeklyPlan.weeks as RawWeek[]).find((w) => w.week === week.week_number);
    if (!raw) continue;

    raw.tasks.forEach((t, i) => {
      // The dashboard task in Week 1 is done by definition — you are reading it.
      const isDashboardTask = week.week_number === 1 && t.task.toLowerCase().includes('thesis dashboard');
      tasks.push({
        id: `w${week.week_number}-t${i + 1}`,
        week_id: week.id,
        evaluation_component_id: t.component ?? null,
        title: t.task,
        description: null,
        priority: (t.priority as Priority) ?? 'medium',
        status: isDashboardTask ? 'done' : 'todo',
        due_date: week.end_date,
        completed_at: isDashboardTask ? SEED_TIMESTAMP : null,
        sort_order: i,
        created_at: SEED_TIMESTAMP,
        updated_at: SEED_TIMESTAMP,
      });
    });
  }

  const week1 = weeks.find((w) => w.week_number === 1);
  PRE_COMPLETED_WEEK_1.forEach((t, i) => {
    tasks.push({
      id: `w1-pre${i + 1}`,
      week_id: week1?.id ?? 1,
      evaluation_component_id: t.component,
      title: t.title,
      description: t.description,
      priority: t.priority,
      status: 'done',
      due_date: week1?.end_date ?? '2026-09-06',
      completed_at: SEED_TIMESTAMP,
      sort_order: 100 + i,
      created_at: SEED_TIMESTAMP,
      updated_at: SEED_TIMESTAMP,
    });
  });

  return tasks;
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
        'The Time-Activity Supplement is drafted but unsubmitted. School and secondary-residence addresses are HIPAA identifiers. If the approved consent does not already cover geocoding beyond the primary residence, this becomes a consent addendum (4–6 weeks) rather than a modification (2–4 weeks). Confirm the consent language before anything else — it sets the whole fall timeline.',
      is_pinned: true,
      created_at: SEED_TIMESTAMP,
      updated_at: SEED_TIMESTAMP,
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
    files: [],
    links: buildLinks(),
    meetings: buildMeetings(weeks),
    activity: buildActivity(),
    notes: buildNotes(),
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
