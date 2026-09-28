/**
 * Replaces the placeholder literature review tasks with the real outline.
 *
 *   pnpm migrate:litreview --dry-run
 *   pnpm migrate:litreview
 *
 * The seeded plan guessed at four sections — ambient background, indoor
 * sources, time-activity patterns, composite indices. The outline Aidan
 * actually wrote and sent to Dr. Brown has six major sections and a different
 * spine: it opens on DOHaD, spends a full section establishing why attribution
 * remains equivocal, and only reaches composite indices in the gap analysis.
 * Tracking the guess instead of the real thing would make the 20% component
 * meaningless.
 *
 * The outline also calls for eleven figures and tables. Those are substantial,
 * separable work — a standardized pollutant effect-estimate table is days, not
 * an afternoon — so they are tracked rather than buried inside "write section 3".
 *
 * Completed tasks are never touched.
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

const COMPONENT = 'fall_lit_review';

/** Placeholder sections from the seeded plan, superseded by the real outline. */
const RETIRE = ['w4-t1', 'w4-t2', 'w5-t1', 'w5-t2'];

interface NewTask {
  id: string;
  week_id: number;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  component?: string;
}

/**
 * Six sections across Weeks 5-9, with Draft #1 due Oct 26 and the final Nov 2.
 * Section 3 is split because it carries outdoor, indoor and social determinants
 * and is the largest single block in the outline.
 */
const SECTIONS: NewTask[] = [
  {
    id: 'lr-s1',
    week_id: 5,
    title: 'Lit review §1: DOHaD origins and the case for cumulative early-life exposure',
    description:
      'Frames exposure history to health outcome. Includes the conceptual framework figure (exposure to integrated metric to outcome) and air quality in global health.',
    priority: 'high',
  },
  {
    id: 'lr-s2',
    week_id: 5,
    title: 'Lit review §2: Asthma pathophysiology and why attribution remains equivocal',
    description:
      'Phenotypes and endotypes, atopic versus non-atopic, established triggers including viral and meteorologic, oxidative stress and inflammatory pathways, prenatal PM2.5 and DNA methylation evidence. Closes on correlated mixtures, exposure misclassification, and heterogeneous outcome definitions.',
    priority: 'high',
  },
  {
    id: 'lr-s3a',
    week_id: 6,
    title: 'Lit review §3a: Exposome framework and outdoor criteria pollutants',
    description:
      'Why single-pollutant models are insufficient. PM2.5 and PM10 treated separately, ozone as secondary and regional, SO2 as the point-source case, NO2/NOx as traffic surrogate and indoor combustion product. Monitoring networks, NAAQS and WHO AQG, and the limits of station density and nearest-station assignment.',
    priority: 'high',
  },
  {
    id: 'lr-s3b',
    week_id: 7,
    title: 'Lit review §3b: Indoor and hybrid exposures, plus social determinants as modifiers',
    description:
      'Household sources, observational versus intervention evidence, infiltration and I/O ratios, measurement limitations. Poverty, parental education, housing quality and neighborhood opportunity as modifiers. Closes with documented exposome-asthma relationships.',
    priority: 'high',
  },
  {
    id: 'lr-s4',
    week_id: 7,
    title: 'Lit review §4: BREATHE-CC cohort design and protocol',
    description:
      'Primary citation is the BMC Public Health protocol. Study design framing, Corpus Christi and Refinery Row geography, petrochemical influence, SES, the TCEQ monitoring network, participant pool and expected demographics, measures and longitudinal design.',
    priority: 'high',
  },
  {
    id: 'lr-s5',
    week_id: 8,
    title: 'Lit review §5: Establish the gap',
    description:
      'How multi-pollutant outdoor exposure is presently estimated (AQI/AQHI and additive metrics), how indoor exposure is largely not assessed, how the two literatures do not overlap, and how composite indices are built and thinly validated. The core argument of the review.',
    priority: 'critical',
  },
  {
    id: 'lr-s6',
    week_id: 9,
    title: 'Lit review §6: Present study, rationale, and goals',
    description:
      'The IEI concept and its application in a longitudinal pediatric cohort, planned construction method, operationalisation of both sub-indices, temporal unit, validation goals including comparison against single-pollutant models, and stated scope boundaries.',
    priority: 'critical',
  },
];

/** The eleven figures and tables the outline calls for, grouped into five jobs. */
const ARTEFACTS: NewTask[] = [
  {
    id: 'lr-fig-concept',
    week_id: 6,
    title: 'Build conceptual figures: exposure-to-outcome framework, BREATHE-CC design, IEI workflow',
    description:
      'Three diagrams the outline calls for at §1.b, §4.a.i and §6.b.ii. Shared visual language across all three.',
    priority: 'high',
  },
  {
    id: 'lr-tbl-pollutant',
    week_id: 6,
    title: 'Build consolidated pollutant effect-estimate table with standardized increments',
    description:
      'Pollutant, increment, effect estimate, outcome, population, source — increments standardized so rows are comparable (§3.b.ii.1). Must address the PM2.5/PM10 double-counting problem and flag which estimates are pediatric-specific.',
    priority: 'high',
  },
  {
    id: 'lr-tbl-tceq',
    week_id: 7,
    title: 'Build TCEQ monitoring network map and station characteristics table',
    description:
      'Map figure plus exact coordinates, FEM/FRM status, sensor model, pollutants measured, and QC frequency per station (§4.b.iv). Also the measures and longitudinal design flow chart at §4.d.i.',
    priority: 'medium',
  },
  {
    id: 'lr-tbl-gap',
    week_id: 8,
    title: 'Build gap tables: multi-pollutant composite studies and indoor measurement limitations',
    description:
      'Studies using combined additive metrics beyond AQI, demonstrating differential inference under multi-pollutant treatment (§5.a.ii), and indoor studies with stated limitations and future recommendations (§5.b.i).',
    priority: 'high',
  },
  {
    id: 'lr-tbl-iei',
    week_id: 9,
    title: 'Build IEI parameters table: fields, data source, and type',
    description:
      'Every input to the index with its data source and type (§6.b.i). Doubles as the specification input for the IEI construction spec due Oct 21.',
    priority: 'high',
  },
];

/** Dr. Brown's feedback on the outline, which is a distinct piece of writing. */
const FEEDBACK: NewTask[] = [
  {
    id: 'lr-why',
    week_id: 9,
    title: 'Write the explicit "why should anyone care" rationale into §6',
    description:
      'Dr. Brown feedback on the outline: make the case plainly for why the sample, the problem, and the mechanistic understanding matter. She asked for this specifically in Section 6, not distributed through the review.',
    priority: 'critical',
  },
];

const ALL = [...SECTIONS, ...ARTEFACTS, ...FEEDBACK];

async function main() {
  const { data: weeks } = await sb.from('weeks').select('id,week_number,end_date');
  const endOf = new Map((weeks ?? []).map((w) => [w.week_number as number, w.end_date as string]));

  /* ---- Retire the placeholders ------------------------------------------ */
  say('\n── Placeholder sections retired ──');
  for (const id of RETIRE) {
    const { data: t } = await sb.from('tasks').select('id,title,status').eq('id', id).maybeSingle();
    if (!t) {
      say(`  gone    ${id}`);
      continue;
    }
    if (t.status === 'done') {
      say(`  SKIP    ${id} — marked done, keeping it`);
      continue;
    }
    say(`  delete  ${id}  ${String(t.title).slice(0, 62)}`);
    if (!DRY) {
      const { error } = await sb.from('tasks').delete().eq('id', id);
      if (error) throw new Error(`${id}: ${error.message}`);
    }
  }

  /* ---- Add the real outline --------------------------------------------- */
  say('\n── Outline tasks ──');
  let order = 10;
  for (const t of ALL) {
    const { data: prior } = await sb.from('tasks').select('id').eq('id', t.id).maybeSingle();
    if (prior) {
      say(`  exists  ${t.id}`);
      order += 1;
      continue;
    }
    say(`  wk${String(t.week_id).padEnd(2)} + ${t.title.slice(0, 74)}`);
    if (!DRY) {
      const now = new Date().toISOString();
      const { error } = await sb.from('tasks').insert({
        id: t.id,
        week_id: t.week_id,
        evaluation_component_id: t.component ?? COMPONENT,
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: 'todo',
        due_date: endOf.get(t.week_id) ?? null,
        sort_order: order,
        created_at: now,
        updated_at: now,
      });
      if (error) throw new Error(`${t.id}: ${error.message}`);
    }
    order += 1;
  }

  /* ---- Report ------------------------------------------------------------ */
  const { data: lit } = await sb
    .from('tasks')
    .select('week_id,status')
    .eq('evaluation_component_id', COMPONENT);

  const byWeek = new Map<number, number>();
  for (const t of lit ?? []) byWeek.set(t.week_id as number, (byWeek.get(t.week_id as number) ?? 0) + 1);

  console.log('\n── Literature review load ──');
  for (const n of [...byWeek.keys()].sort((a, b) => a - b)) {
    console.log(`  wk${String(n).padStart(2)}  ${'#'.repeat(byWeek.get(n)!)} (${byWeek.get(n)})`);
  }
  const done = (lit ?? []).filter((t) => t.status === 'done').length;
  console.log(`\n  ${done} done of ${(lit ?? []).length} literature review tasks`);
  if (DRY) console.log('\n  Nothing written. Re-run without --dry-run to apply.\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
