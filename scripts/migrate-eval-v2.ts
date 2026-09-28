/**
 * Migrates the live database to the v2 evaluation criteria (approved Sep 2026).
 *
 *   pnpm migrate:eval-v2 --dry-run   # print every change, touch nothing
 *   pnpm migrate:eval-v2             # apply
 *
 * WHY THIS EXISTS RATHER THAN `pnpm seed`
 * ---------------------------------------
 * The seeder rebuilds every task from weekly-plan.json with status 'todo'.
 * Running it here would silently erase 17 completed tasks. This migration is
 * deliberately surgical: it updates component metadata, moves specific task
 * links, and rewrites specific week deliverables. It never touches a task's
 * status, completed_at, or a component's status/grade_notes.
 *
 * WHAT CHANGED IN v2
 * ------------------
 * Fall keeps all six original components (reweighted, renamed, re-dated) and
 * gains the Command Center at 10%. Spring separates the IEI construction
 * pipeline from the health outcome pipeline — they answer different questions,
 * so they are no longer one component with a draft and a final — and promotes
 * the Final Thesis Draft to its own 20% component.
 *
 * Component ids are preserved wherever the underlying work is the same, which
 * is what keeps completed tasks attached to the right component.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'node:path';
import criteria from '../context/evaluation-criteria.json';

config({ path: resolve(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.');
  process.exit(1);
}

const sb = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const DRY = process.argv.includes('--dry-run');
const say = (s: string) => console.log(`${DRY ? '[dry-run] ' : ''}${s}`);

/** Component removed in v2. Its tasks are rehomed before it is deleted. */
const REMOVED_COMPONENT = 'spring_final_pipeline';

/**
 * Task relinks.
 *
 * The Spring split is a real reclassification, not bookkeeping: the IEI pipeline
 * builds and validates the index, the health outcome pipeline tests it against
 * BREATHE-CC participants. Tasks that recalculate the IEI or run sensitivity on
 * its construction belong to the former even though they lived under the old
 * combined component.
 */
const RELINK: Array<{ taskId: string; to: string; why: string }> = [
  // Was "Final Health Outcome Analysis Pipeline" — no initial/final split now.
  { taskId: 'w24-t1', to: 'spring_pipeline_draft', why: 'committee feedback on the outcome pipeline' },
  { taskId: 'w27-t2', to: 'spring_pipeline_draft', why: 'finalising the outcome pipeline' },
  { taskId: 'w29-t2', to: 'spring_pipeline_draft', why: 'final outcome pipeline revisions' },
  { taskId: 'w30-t1', to: 'spring_pipeline_draft', why: 'submitting the outcome pipeline' },
  { taskId: 'w29-t3', to: 'spring_iei_pipeline', why: 'repository documentation now sits with the IEI pipeline' },

  // IEI construction work misfiled under the old combined health outcome draft.
  { taskId: 'w17-t2', to: 'spring_iei_pipeline', why: 'time-activity inventory feeds IEI calculation' },
  { taskId: 'w17-t3', to: 'spring_iei_pipeline', why: 'recalculating the IEI itself' },
  { taskId: 'w22-t2', to: 'spring_iei_pipeline', why: 'sensitivity on IEI construction is IEI validation' },

  // The dashboard is now a graded component; this work is already complete.
  { taskId: 'w1-t7', to: 'fall_command_center', why: 'building the dashboard' },
];

/** Matched by title so it survives an id change in the plan file. */
const RELINK_BY_TITLE: Array<{ match: string; to: string }> = [
  { match: 'finalize logins and send out invites', to: 'fall_command_center' },
];

/** Interim deadline the schema cannot hold on the component itself. */
const NEW_TASKS = [
  {
    id: 'w9-litdraft',
    week_id: 9,
    evaluation_component_id: 'fall_lit_review',
    title: 'Submit IEI Literature Review Draft #1 to Dr. Brown',
    description:
      'Interim deadline from the v2 criteria. The component records the Nov 2 final date; this is the Oct 26 draft milestone.',
    priority: 'high',
    status: 'todo',
    due_date: '2026-10-26',
    sort_order: 90,
  },
];

/**
 * Deliverable labels per week. Deadlines moved by up to three weeks, so these
 * are replaced wholesale rather than patched — every quoted weight was stale.
 */
const WEEK_DELIVERABLES: Record<number, string[]> = {
  3: ['IRB Modification Package'],
  4: ['IEI Annotated Bibliography (15% of Fall grade)'],
  5: ['IEI Command Center shared with committee (10% of Fall grade)'],
  7: [],
  8: ['IEI Construction Pipeline draft for review (15% of Fall grade)'],
  9: ['IEI Literature Review — Draft #1 (20% of Fall grade)'],
  10: ['IEI Literature Review — Final draft (20% of Fall grade)'],
  11: ['IEI Manuscript Draft (10% of Fall grade)'],
  14: ['Fall Progress Presentation (15% of Fall grade)'],
  23: [],
  25: ['Finalized IEI Construction/Calculation Pipeline (10% of Spring grade)'],
  28: ['IEI Manuscript Finalization (15% of Spring grade)'],
  30: [
    'Health Outcome Analysis Pipeline (5% of Spring grade)',
    'Research Poster (15% of Spring grade)',
  ],
  32: ['Thesis Defense (20% of Spring grade)'],
  33: [
    'Final Thesis Draft (20% of Spring grade)',
    'Final Thesis Submission to Rollins Honors Program',
  ],
};

async function main() {
  /* ---- 1. Components: metadata only, never status ------------------------ */
  const semesters = [
    { key: 'fall_2026', data: criteria.fall_2026 },
    { key: 'spring_2027', data: criteria.spring_2027 },
  ] as const;

  const { data: existing } = await sb.from('evaluation_components').select('id,status,weight,name');
  const existingById = new Map((existing ?? []).map((c) => [c.id as string, c]));

  say('\n── Components ──');
  for (const { key, data } of semesters) {
    for (const [i, c] of data.components.entries()) {
      const prior = existingById.get(c.id);
      const row = {
        id: c.id,
        semester: key,
        name: c.name,
        weight: c.weight,
        description: c.description,
        due_date: c.due_date,
        sort_order: i,
        // Status is only set for genuinely new rows; existing progress stands.
        ...(prior ? {} : { status: c.status === 'ongoing' ? 'in_progress' : 'not_started' }),
      };

      if (prior) {
        const changes: string[] = [];
        if (prior.name !== c.name) changes.push(`name → "${c.name}"`);
        if (prior.weight !== c.weight) changes.push(`weight ${prior.weight}% → ${c.weight}%`);
        if (!changes.length) changes.push('dates/description');
        say(`  update ${c.id.padEnd(22)} ${changes.join(', ')} (status "${prior.status}" preserved)`);
      } else {
        say(`  CREATE ${c.id.padEnd(22)} ${c.weight}% — ${c.name}`);
      }

      if (!DRY) {
        const { error } = await sb.from('evaluation_components').upsert(row);
        if (error) throw new Error(`${c.id}: ${error.message}`);
      }
    }
  }

  /* ---- 2. Relink tasks before the old component disappears --------------- */
  say('\n── Task relinks ──');
  for (const r of RELINK) {
    const { data: t } = await sb.from('tasks').select('id,title,status').eq('id', r.taskId).maybeSingle();
    if (!t) {
      say(`  skip   ${r.taskId} — not found`);
      continue;
    }
    say(`  → ${r.to.padEnd(22)} [${t.status}] ${String(t.title).slice(0, 58)}  (${r.why})`);
    if (!DRY) {
      const { error } = await sb
        .from('tasks')
        .update({ evaluation_component_id: r.to })
        .eq('id', r.taskId);
      if (error) throw new Error(`${r.taskId}: ${error.message}`);
    }
  }

  for (const r of RELINK_BY_TITLE) {
    const { data: hits } = await sb.from('tasks').select('id,title,status').ilike('title', `%${r.match}%`);
    for (const t of hits ?? []) {
      say(`  → ${r.to.padEnd(22)} [${t.status}] ${String(t.title).slice(0, 58)}`);
      if (!DRY) {
        const { error } = await sb
          .from('tasks')
          .update({ evaluation_component_id: r.to })
          .eq('id', t.id);
        if (error) throw new Error(`${t.id}: ${error.message}`);
      }
    }
  }

  /* ---- 3. Safety net: nothing may still point at the removed component --- */
  const { data: stragglers } = await sb
    .from('tasks')
    .select('id,title')
    .eq('evaluation_component_id', REMOVED_COMPONENT);

  if (stragglers?.length) {
    say(`\n  ${stragglers.length} task(s) still on ${REMOVED_COMPONENT}; moving to the outcome pipeline:`);
    for (const t of stragglers) say(`    ${t.id} ${String(t.title).slice(0, 60)}`);
    if (!DRY) {
      const { error } = await sb
        .from('tasks')
        .update({ evaluation_component_id: 'spring_pipeline_draft' })
        .eq('evaluation_component_id', REMOVED_COMPONENT);
      if (error) throw new Error(`stragglers: ${error.message}`);
    }
  }

  /* ---- 4. Remove the retired component ----------------------------------- */
  say('\n── Removed component ──');
  if (existingById.has(REMOVED_COMPONENT)) {
    say(`  delete ${REMOVED_COMPONENT} (Final Health Outcome Analysis Pipeline, 15%)`);
    if (!DRY) {
      const { error } = await sb.from('evaluation_components').delete().eq('id', REMOVED_COMPONENT);
      if (error) throw new Error(`delete ${REMOVED_COMPONENT}: ${error.message}`);
    }
  } else {
    say(`  ${REMOVED_COMPONENT} already gone`);
  }

  /* ---- 5. New tasks ------------------------------------------------------ */
  say('\n── New tasks ──');
  for (const t of NEW_TASKS) {
    const { data: prior } = await sb.from('tasks').select('id,status').eq('id', t.id).maybeSingle();
    if (prior) {
      say(`  exists ${t.id} (status "${prior.status}" left alone)`);
      continue;
    }
    say(`  CREATE ${t.id} — ${t.title}`);
    if (!DRY) {
      const now = new Date().toISOString();
      const { error } = await sb.from('tasks').insert({ ...t, created_at: now, updated_at: now });
      if (error) throw new Error(`${t.id}: ${error.message}`);
    }
  }

  /* ---- 6. Week deliverable labels ---------------------------------------- */
  say('\n── Week deliverables ──');
  for (const [weekNumber, deliverables] of Object.entries(WEEK_DELIVERABLES)) {
    const n = Number(weekNumber);
    const { data: w } = await sb
      .from('weeks')
      .select('id,deliverables')
      .eq('week_number', n)
      .maybeSingle();
    if (!w) {
      say(`  skip   week ${n} — not found`);
      continue;
    }
    const before = (w.deliverables ?? []) as string[];
    if (JSON.stringify(before) === JSON.stringify(deliverables)) continue;
    say(`  week ${String(n).padEnd(2)} ${before.length ? before.join(' | ') : '(none)'}`);
    say(`       → ${deliverables.length ? deliverables.join(' | ') : '(none)'}`);
    if (!DRY) {
      const { error } = await sb.from('weeks').update({ deliverables }).eq('id', w.id);
      if (error) throw new Error(`week ${n}: ${error.message}`);
    }
  }

  /* ---- 7. Report --------------------------------------------------------- */
  const { data: after } = await sb
    .from('evaluation_components')
    .select('id,semester,name,weight,due_date,status')
    .order('semester')
    .order('sort_order');

  say('\n── Result ──');
  for (const sem of ['fall_2026', 'spring_2027']) {
    const rows = (after ?? []).filter((c) => c.semester === sem);
    const total = rows.reduce((n, c) => n + (c.weight as number), 0);
    console.log(`\n  ${sem}  (total ${total}%)`);
    for (const c of rows) {
      console.log(
        `    ${String(c.weight).padStart(3)}%  ${String(c.due_date ?? '—').padEnd(12)} ${String(c.status).padEnd(12)} ${c.name}`,
      );
    }
    if (total !== 100) console.error(`  WARNING: ${sem} totals ${total}%, not 100%.`);
  }

  const { count: doneCount } = await sb
    .from('tasks')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'done');
  console.log(`\n  Completed tasks still marked done: ${doneCount}`);
  if (DRY) console.log('\n  Nothing was written. Re-run without --dry-run to apply.\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
