/**
 * Seeds a Supabase project from the JSON context files.
 *
 *   pnpm seed            # upsert everything (safe to re-run)
 *   pnpm seed -- --wipe  # delete existing rows first
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 * The service role key bypasses Row Level Security, which is exactly why this
 * runs from your machine and never from the browser.
 *
 * Ids are deterministic (`w3-t2`, `meeting-w3`), so re-running updates rows in
 * place rather than duplicating them.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'node:path';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    '\nMissing credentials.\n\n' +
      '  NEXT_PUBLIC_SUPABASE_URL   ' + (url ? 'ok' : 'MISSING') + '\n' +
      '  SUPABASE_SERVICE_ROLE_KEY  ' + (serviceKey ? 'ok' : 'MISSING') + '\n\n' +
      'Copy .env.local.example to .env.local and fill both in (Supabase → Project Settings → API).\n',
  );
  process.exit(1);
}

const sb = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const wipe = process.argv.includes('--wipe');

async function main() {
  // Imported here so the credential check above runs first — a missing key
  // should print advice, not a module resolution error.
  const { buildSeedState } = await import('../src/lib/data/seed');
  const state = buildSeedState();

  if (wipe) {
    console.log('Wiping existing rows…');
    for (const table of ['activity_log', 'notes', 'links', 'files', 'meetings', 'tasks', 'weeks', 'evaluation_components']) {
      // `neq` on the primary key deletes everything while satisfying the
      // client's requirement that delete() carry a filter.
      const { error } = await sb.from(table).delete().neq('id', '__none__');
      if (error) console.warn(`  ${table}: ${error.message}`);
    }
  }

  const steps: Array<[string, unknown[]]> = [
    ['evaluation_components', state.components],
    // `is_current` is derived at read time; do not persist a value that goes stale.
    ['weeks', state.weeks.map(({ is_current: _drop, ...w }) => w)],
    ['tasks', state.tasks],
    ['meetings', state.meetings],
    ['links', state.links],
    ['notes', state.notes],
    ['activity_log', state.activity],
  ];

  for (const [table, rows] of steps) {
    if (!rows.length) {
      console.log(`  ${table}: nothing to seed`);
      continue;
    }
    const { error } = await sb.from(table).upsert(rows as never[]);
    if (error) {
      console.error(`  ${table}: FAILED — ${error.message}`);
      process.exitCode = 1;
    } else {
      console.log(`  ${table}: ${rows.length} rows`);
    }
  }

  console.log(
    '\nSeeded.\n' +
      '\nNext: give yourself the student role.\n\n' +
      '  1. Supabase dashboard → Authentication → Users → Invite Ameyers@rollins.edu\n' +
      '  2. Accept the invite email and set a password.\n' +
      '  3. The on_auth_user_created trigger has already made your profile row\n' +
      '     with the read-only "committee" role. Promote it in the SQL editor:\n\n' +
      "       update public.profiles set role = 'student'\n" +
      "       where email = 'Ameyers@rollins.edu';\n\n" +
      'Row Level Security denies every read until a profile row exists, and denies\n' +
      'every write until that row says "student".\n',
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
