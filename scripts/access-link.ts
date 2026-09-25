/**
 * Mints a sign-in link locally, without sending an email.
 *
 *   pnpm access-link <email> [--role <role>] [--name "Dr. Jane Doe"] [--url https://host/]
 *
 * Why this exists: Supabase's built-in SMTP is rate-limited to a handful of
 * messages per hour on the free tier. Invite a committee member, mistype
 * something, retry, and you are locked out of your own onboarding for an hour
 * with "email rate limit exceeded".
 *
 * `generateLink` performs the same server-side work as an invite but returns the
 * URL instead of mailing it, so it never touches the rate limiter. Paste the
 * printed link into a browser and it behaves exactly like the emailed one.
 *
 * The link is single-use and expires. Open it once, in a browser where the app
 * is actually running — a failed page load still spends the token.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY, so it only ever runs on your machine.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'node:path';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.');
  process.exit(1);
}

const ROLES = ['student', 'sponsor', 'committee', 'external'] as const;
type Role = (typeof ROLES)[number];

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const email = process.argv[2];
const role = arg('--role') as Role | undefined;
const fullName = arg('--name');

/**
 * Supabase matches redirect targets against the allow-list literally, and the
 * usual entry is `https://host/**`. A bare origin with no trailing slash does
 * not match that pattern, so Supabase silently falls back to the Site URL —
 * handing you a link that looks right and lands somewhere else. Normalising
 * here removes the whole class of mistake.
 */
function normalize(raw: string): string {
  try {
    const u = new URL(raw);
    if (u.pathname === '' || u.pathname === '/') u.pathname = '/';
    return u.toString();
  } catch {
    return raw;
  }
}

const redirectTo = normalize(arg('--url') ?? 'http://localhost:3000/');

if (!email || email.startsWith('--')) {
  console.error(
    'Usage: pnpm access-link <email> [--role student|committee|sponsor|external] [--name "Dr. Jane Doe"] [--url https://host/]',
  );
  process.exit(1);
}

if (role && !ROLES.includes(role)) {
  console.error(`--role must be one of: ${ROLES.join(', ')}`);
  process.exit(1);
}

const sb = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function findUser(target: string) {
  // listUsers is paginated and has no server-side email filter, so walk pages.
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(error.message);
    const hit = data.users.find((u) => u.email?.toLowerCase() === target.toLowerCase());
    if (hit) return hit;
    if (data.users.length < 200) return null;
  }
  return null;
}

async function main() {
  const existing = await findUser(email);

  // 'invite' creates the account; 'magiclink' signs in one that already exists.
  const type = existing ? 'magiclink' : 'invite';

  const { data, error } = await sb.auth.admin.generateLink({
    type,
    email,
    options: { redirectTo },
  });

  if (error) {
    console.error(`Could not generate a link: ${error.message}`);
    process.exit(1);
  }

  const userId = data.user?.id ?? existing?.id;

  if ((role || fullName) && userId) {
    // The signup trigger assigns 'committee' and derives a name from the email
    // local part — "sbrown" is not what should appear next to a committee
    // member's comments. Override both here so onboarding needs no SQL step.
    // Runs as service role, which bypasses RLS by design.
    const patch: Record<string, string> = {};
    if (role) patch.role = role;
    if (fullName) patch.full_name = fullName;

    const { error: profileError } = await sb.from('profiles').update(patch).eq('id', userId);

    if (profileError) console.warn(`  Profile update failed: ${profileError.message}`);
    else console.log(`  Profile set: ${Object.entries(patch).map(([k, v]) => `${k}='${v}'`).join(', ')}`);
  }

  // Verify the link actually points where we asked. Supabase does not error on
  // a rejected redirect target — it quietly substitutes the Site URL, so the
  // only way to catch it is to read the link back.
  const actual = new URL(data.properties.action_link).searchParams.get('redirect_to');
  if (actual && actual.replace(/\/$/, '') !== redirectTo.replace(/\/$/, '')) {
    console.error(
      '\n  WARNING: this link does NOT go where you asked.\n' +
        `    requested: ${redirectTo}\n` +
        `    actual:    ${actual}\n\n` +
        '  Supabase rejected the target and fell back to your Site URL. Add it under\n' +
        '  Authentication -> URL Configuration -> Redirect URLs (e.g. https://host/**)\n' +
        '  and run this again. Do not send the link below.\n',
    );
    process.exitCode = 1;
  }

  console.log(
    `\n${existing ? 'Sign-in' : 'Invite'} link for ${email}` +
      `\nRedirects to ${redirectTo}` +
      '\nSingle use. Make sure the app is running there BEFORE you open it.\n\n' +
      data.properties.action_link +
      '\n',
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
