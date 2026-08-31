/**
 * Creates the two Supabase Storage buckets the dashboard uses.
 *
 *   pnpm setup:storage
 *
 * Both buckets are PRIVATE. The app serves files through short-lived signed
 * URLs, so a deliverable is never publicly addressable just because someone
 * guessed the path.
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
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
      'Copy .env.local.example to .env.local and fill both in.',
  );
  process.exit(1);
}

const sb = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const BUCKETS = [
  {
    id: 'deliverables',
    description: 'Manuscripts, bibliographies, presentations, analysis outputs',
    fileSizeLimit: 52_428_800, // 50 MB — a poster PDF has room to breathe
    allowedMimeTypes: null,
  },
  {
    id: 'meeting-docs',
    description: 'Meeting agendas, notes, handouts',
    fileSizeLimit: 20_971_520, // 20 MB
    allowedMimeTypes: null,
  },
];

async function main() {
  const { data: existing, error: listError } = await sb.storage.listBuckets();
  if (listError) {
    console.error(`Could not list buckets: ${listError.message}`);
    process.exit(1);
  }

  for (const bucket of BUCKETS) {
    if (existing?.some((b) => b.name === bucket.id)) {
      console.log(`  ${bucket.id}: already exists`);
      continue;
    }
    const { error } = await sb.storage.createBucket(bucket.id, {
      public: false,
      fileSizeLimit: bucket.fileSizeLimit,
    });
    if (error) {
      console.error(`  ${bucket.id}: FAILED — ${error.message}`);
      process.exitCode = 1;
    } else {
      console.log(`  ${bucket.id}: created (private) — ${bucket.description}`);
    }
  }

  console.log(
    '\nBuckets ready. Access is governed by the storage policies in\n' +
      'supabase/migrations/001_initial_schema.sql — run that migration if you have not.\n',
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
