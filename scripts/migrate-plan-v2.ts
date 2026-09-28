/**
 * Re-times the 33-week plan for the v2 criteria.
 *
 *   pnpm migrate:plan-v2 --dry-run
 *   pnpm migrate:plan-v2
 *
 * WHAT CHANGED AND WHY
 * --------------------
 * The original plan front-loaded IEI construction into the Fall: kriging by
 * Week 5, indoor concentration modelling by Week 6, a validated composite by
 * Week 8. Under the v2 criteria the Fall is literature review and methods
 * *planning*; the IEI is specified in the Fall and built, validated and
 * analysed in the Spring. So execution work moves out of Weeks 5-12 and into
 * Weeks 17-25, and the Fall gains the specification work that was missing.
 *
 * Health outcome analysis shifts four weeks later to sit behind the IEI it
 * depends on — you cannot regress outcomes on an index that does not exist yet.
 *
 * SAFETY
 * ------
 * Completed tasks are never moved, retitled or deleted; the script refuses to
 * touch anything with status 'done' and reports if it skipped one. Moving a
 * task also moves its due date to the new week's end, matching what the app
 * does when you reassign a task by hand.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'node:path';

config({ path: resolve(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('Missing Supabase credentials in .env.local.');
  process.exit(1);
}
const sb = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const DRY = process.argv.includes('--dry-run');
const say = (s: string) => console.log(`${DRY ? '[dry] ' : ''}${s}`);

/* -------------------------------------------------------------------------- */

const WEEK_TITLES: Record<number, string> = {
  // Fall: literature review, then methods specification.
  5: 'Literature Review: Ambient & Indoor Exposure',
  6: 'Literature Review: Time-Activity & Composite Indices',
  7: 'Literature Review Synthesis & Methods Planning',
  8: 'IEI Construction Spec — Draft for Review',
  9: 'Lit Review Draft #1 Due / Manuscript Introduction',
  10: 'Literature Review Final Due',
  11: 'IEI Manuscript Draft Due',
  12: 'Spring Analysis Plan & Presentation Prep',
  // Spring: build the IEI, then test it against outcomes.
  17: 'Spring Kickoff: Spatial Surfaces',
  18: 'Indoor Scoring & Infiltration Modeling',
  19: 'IEI Composite Construction & Time-Weighting',
  20: 'IEI Computation & Spatial Sensitivity',
  21: 'IEI Validation & Model Comparison',
  22: 'IEI Documentation / Exacerbation Models',
  23: 'C-ACT Models & IEI Pipeline Review',
  24: 'GBTM Phenotyping & Manuscript Revision',
  25: 'Finalized IEI Pipeline Due',
  26: 'Outcome Sensitivity & Final Manuscript Push',
  27: 'Health Outcome Pipeline Assembly',
};

/** taskId → target week. Due dates follow the destination week's end. */
const MOVES: Record<string, number> = {
  // ---- Fall execution work that now belongs to Spring --------------------
  's:w5-t3': 17, // ordinary kriging, PM2.5 surface
  's:w5-t4': 17, // extend kriging to O3, SO2, PM10
  's:w6-t1': 18, // indoor survey scoring module
  's:w6-t2': 18, // infiltration factor model
  's:w6-t3': 18, // C_indoor = F_inf * C_ambient + C_source
  's:w7-t2': 19, // composite IEI score function
  's:w7-t3': 19, // time-weighting logic
  's:w9-t1': 19, // multi-household time-weighting
  's:w8-t1': 20, // run IEI on available participants
  's:w8-t2': 20, // sensitivity: IDW vs ordinary vs universal kriging
  's:w8-t3': 21, // sensitivity: indoor/outdoor weighting schemes
  's:w8-t4': 21, // compare IEI against single-pollutant measures
  's:w9-t3': 22, // document pipeline code
  's:w10-t2': 25, // push complete IEI pipeline to GitHub — Mar 15 deadline
  's:w10-t3': 22, // exploratory bivariate analyses open the outcome work

  // ---- Spread the four literature review sections across two weeks -------
  // All four sat in Week 5, which is both unrealistic and at odds with the
  // week titles. Sections 1-2 stay; 3-4 move to Week 6.
  'l:w5-t1': 6, // Section 3: time-activity patterns
  'l:w5-t2': 6, // Section 4: composite indices and the methodological gap

  // ---- Fall re-dating to match the new deadlines -------------------------
  'f:w7-t1': 10, // finalise literature review — now due Nov 2
  'f:w10-t1': 11, // submit IEI manuscript draft — now due Nov 9
  'f:w4-t3': 8, // R project scaffold belongs with the spec, not with kriging

  // ---- Health outcome work moves behind the IEI it depends on ------------
  'h:w18-t1': 22,
  'h:w18-t2': 22,
  'h:w18-t3': 22,
  'h:w19-t1': 23,
  'h:w19-t2': 23,
  'h:w19-t3': 23,
  'h:w20-t1': 24,
  'h:w20-t2': 24,
  'h:w20-t3': 24,
  'h:w21-t1': 25,
  'h:w21-t2': 25,
  'h:w21-t3': 26,
  'h:w22-t1': 26,
  'h:w22-t3': 26,
  'h:w22-t4': 27,
  'h:w23-t1': 27,
  // w22-t2 deliberately stays put: sensitivity on IEI *construction* is IEI
  // validation and must land before the Mar 15 pipeline deadline.
};

/**
 * Titles that still promise Fall work which now happens in the Spring. Left
 * unchanged they would have the committee expecting validation results in a
 * semester with no validation in it.
 */
const RETITLE: Array<{ id: string; title: string }> = [
  {
    id: 'w9-t2',
    title:
      'Write manuscript Planned Methods section: IEI construction approach, spatial methods, indoor modeling',
  },
  {
    id: 'w13-t1',
    title:
      'Finalize Fall Progress Presentation: literature synthesis, IEI construction spec, and spring execution plan',
  },
  {
    id: 'w15-t1',
    title: 'Incorporate presentation feedback into the methods specification and manuscript',
  },
];

/** Fall tasks duplicated by fuller Spring equivalents. */
const DELETE: Array<{ id: string; because: string }> = [
  { id: 'w11-t1', because: 'duplicates w18-t1 (Poisson/negative binomial pipeline)' },
  { id: 'w11-t2', because: 'duplicates w19-t1 (linear mixed model pipeline)' },
  { id: 'w11-t4', because: 'duplicates w18-t2 (covariate adjustment)' },
  { id: 'w12-t1', because: 'outcome analysis is no longer a Fall activity' },
  { id: 'w12-t2', because: 'duplicates w20-t1 (GBTM trajectory models)' },
];

/** The planning work the Fall was missing. */
const ADD = [
  {
    id: 'w7-methods-outline',
    week_id: 7,
    evaluation_component_id: 'fall_manuscript',
    title: 'Draft Planned Methods outline: IEI construction approach, spatial interpolation choice, indoor exposure modeling',
    description:
      'Feeds the Manuscript Draft "Planned Methods" section. Specification only — the pipeline itself is built in the Spring.',
    priority: 'high',
  },
  {
    id: 'w8-iei-spec',
    week_id: 8,
    evaluation_component_id: 'fall_pipeline',
    title: 'Write IEI construction specification: data sources, kriging approach, indoor scoring rubric, time-weighting formula',
    description:
      'The reviewable artefact for the Oct 21 pipeline checkpoint. Documents what will be built rather than building it.',
    priority: 'critical',
  },
  {
    id: 'w8-spec-submit',
    week_id: 8,
    evaluation_component_id: 'fall_pipeline',
    title: 'Submit IEI Construction Pipeline draft for committee review',
    description: 'Due Oct 21 per the v2 criteria (15% of the Fall grade).',
    priority: 'critical',
  },
  {
    id: 'w12-spring-plan',
    week_id: 12,
    evaluation_component_id: 'fall_presentation',
    title: 'Write Spring analysis plan: IEI validation sequence, sensitivity analyses, outcome model specifications',
    description:
      'Spring carries all IEI execution plus the outcome analysis, so the sequence needs to be agreed before the semester starts.',
    priority: 'high',
  },
  {
    id: 'w12-spatial-plan',
    week_id: 12,
    evaluation_component_id: 'fall_pipeline',
    title: 'Plan spatial component execution: kriging grid design, LOOCV validation approach, monitoring station coverage',
    description: 'Design decisions settled in the Fall so Spring is execution, not deliberation.',
    priority: 'high',
  },
];

/* -------------------------------------------------------------------------- */

async function main() {
  const { data: weeks } = await sb.from('weeks').select('id,week_number,end_date,title');
  const weekByNumber = new Map((weeks ?? []).map((w) => [w.week_number as number, w]));

  /* ---- Week titles ------------------------------------------------------ */
  say('\n── Week titles ──');
  for (const [num, title] of Object.entries(WEEK_TITLES)) {
    const w = weekByNumber.get(Number(num));
    if (!w || w.title === title) continue;
    say(`  wk${String(num).padEnd(2)} "${w.title}"`);
    say(`        → "${title}"`);
    if (!DRY) {
      const { error } = await sb.from('weeks').update({ title }).eq('id', w.id);
      if (error) throw new Error(`week ${num}: ${error.message}`);
    }
  }

  /* ---- Moves ------------------------------------------------------------ */
  say('\n── Task moves ──');
  let skippedDone = 0;
  for (const [key, target] of Object.entries(MOVES)) {
    const taskId = key.slice(2); // strip the grouping prefix
    const { data: t } = await sb
      .from('tasks')
      .select('id,title,week_id,status')
      .eq('id', taskId)
      .maybeSingle();

    if (!t) {
      say(`  missing ${taskId}`);
      continue;
    }
    if (t.status === 'done') {
      say(`  SKIP    ${taskId} — already done, leaving in week ${t.week_id}`);
      skippedDone += 1;
      continue;
    }
    if (t.week_id === target) continue;

    const dest = weekByNumber.get(target);
    say(`  wk${String(t.week_id).padEnd(2)} → wk${String(target).padEnd(2)}  ${String(t.title).slice(0, 66)}`);
    if (!DRY) {
      const { error } = await sb
        .from('tasks')
        .update({ week_id: target, due_date: dest?.end_date ?? null })
        .eq('id', taskId);
      if (error) throw new Error(`${taskId}: ${error.message}`);
    }
  }

  /* ---- Retitles --------------------------------------------------------- */
  say('\n── Task retitles ──');
  for (const r of RETITLE) {
    const { data: t } = await sb.from('tasks').select('id,title,status').eq('id', r.id).maybeSingle();
    if (!t || t.title === r.title) continue;
    if (t.status === 'done') {
      say(`  SKIP    ${r.id} — done, wording left as recorded`);
      skippedDone += 1;
      continue;
    }
    say(`  ${r.id}  "${String(t.title).slice(0, 54)}"`);
    say(`          → "${r.title.slice(0, 54)}"`);
    if (!DRY) {
      const { error } = await sb.from('tasks').update({ title: r.title }).eq('id', r.id);
      if (error) throw new Error(`${r.id}: ${error.message}`);
    }
  }

  /* ---- Deletions -------------------------------------------------------- */
  say('\n── Removed (duplicated in Spring) ──');
  for (const d of DELETE) {
    const { data: t } = await sb.from('tasks').select('id,title,status').eq('id', d.id).maybeSingle();
    if (!t) {
      say(`  gone    ${d.id}`);
      continue;
    }
    if (t.status === 'done') {
      say(`  SKIP    ${d.id} — marked done, keeping it`);
      skippedDone += 1;
      continue;
    }
    say(`  delete  ${d.id}  ${String(t.title).slice(0, 56)}  (${d.because})`);
    if (!DRY) {
      const { error } = await sb.from('tasks').delete().eq('id', d.id);
      if (error) throw new Error(`${d.id}: ${error.message}`);
    }
  }

  /* ---- Additions -------------------------------------------------------- */
  say('\n── New Fall planning tasks ──');
  for (const t of ADD) {
    const { data: prior } = await sb.from('tasks').select('id').eq('id', t.id).maybeSingle();
    if (prior) {
      say(`  exists  ${t.id}`);
      continue;
    }
    const dest = weekByNumber.get(t.week_id);
    say(`  wk${String(t.week_id).padEnd(2)} + ${String(t.title).slice(0, 70)}`);
    if (!DRY) {
      const now = new Date().toISOString();
      const { error } = await sb.from('tasks').insert({
        ...t,
        status: 'todo',
        due_date: dest?.end_date ?? null,
        sort_order: 50,
        created_at: now,
        updated_at: now,
      });
      if (error) throw new Error(`${t.id}: ${error.message}`);
    }
  }

  /* ---- Report ----------------------------------------------------------- */
  const { data: all } = await sb.from('tasks').select('week_id,status').limit(500);
  const counts = new Map<number, { total: number; done: number }>();
  for (const t of all ?? []) {
    const k = (t.week_id as number) ?? 0;
    const c = counts.get(k) ?? { total: 0, done: 0 };
    c.total += 1;
    if (t.status === 'done') c.done += 1;
    counts.set(k, c);
  }

  console.log('\n── Load per week ──');
  for (const n of [...counts.keys()].sort((a, b) => a - b)) {
    const w = weekByNumber.get(n);
    const c = counts.get(n)!;
    const bar = '#'.repeat(Math.min(c.total, 12));
    console.log(
      `  wk${String(n).padStart(2)} ${String(c.total).padStart(2)} ${bar.padEnd(12)} ${c.done ? `(${c.done} done) ` : ''}${w?.title ?? ''}`,
    );
  }

  const doneTotal = (all ?? []).filter((t) => t.status === 'done').length;
  console.log(`\n  Completed tasks: ${doneTotal}`);
  if (skippedDone) console.log(`  Left untouched because they are done: ${skippedDone}`);
  if (DRY) console.log('\n  Nothing written. Re-run without --dry-run to apply.\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
