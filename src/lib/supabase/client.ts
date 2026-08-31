import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * The dashboard runs in one of two modes, decided entirely by whether these two
 * environment variables are set:
 *
 *   Local mode     — no env vars. Seeded from context/*.json, persisted to
 *                    localStorage. Zero setup, works on a static host.
 *   Supabase mode  — env vars present. Shared Postgres, file storage, committee
 *                    logins, realtime.
 *
 * Every component reads through the store, so the UI is identical either way.
 */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

let cached: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!cached) {
    cached = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      realtime: { params: { eventsPerSecond: 5 } },
    });
  }
  return cached;
}

export const STORAGE_BUCKETS = {
  deliverables: 'deliverables',
  meetingDocs: 'meeting-docs',
} as const;
