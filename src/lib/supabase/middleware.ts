import { NextResponse, type NextRequest } from 'next/server';

/**
 * Auth middleware helper for the Vercel (server-rendered) deployment.
 *
 * This is NOT wired up by default: the GitHub Pages build uses `output: 'export'`,
 * and Next.js middleware cannot run in a static export. To enable committee
 * gating on Vercel, create `middleware.ts` at the project root with:
 *
 *   import type { NextRequest } from 'next/server';
 *   import { updateSession } from '@/lib/supabase/middleware';
 *
 *   export async function middleware(request: NextRequest) {
 *     return updateSession(request);
 *   }
 *
 *   export const config = {
 *     matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
 *   };
 *
 * Data protection does not depend on this file. Row Level Security in
 * `supabase/migrations/001_initial_schema.sql` is the actual enforcement layer;
 * middleware only controls which routes render.
 */

/** Routes that never require a session. */
const PUBLIC_PATHS = ['/committee', '/login', '/auth'];

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  const configured =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  // Local mode has no accounts; there is nothing to gate.
  if (!configured) return response;

  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return response;

  // Supabase stores its session in a cookie named `sb-<project-ref>-auth-token`.
  const hasSession = request.cookies
    .getAll()
    .some((c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));

  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/committee';
    url.searchParams.set('reason', 'sign-in-required');
    return NextResponse.redirect(url);
  }

  return response;
}
