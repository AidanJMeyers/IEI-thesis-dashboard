'use client';

import * as React from 'react';
import { KeyRound, LogIn, LogOut, ShieldCheck, ShieldQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Field, Input } from '@/components/ui/form';
import { useStore } from '@/hooks/useDashboard';

/**
 * Sign-in for Supabase mode. There is deliberately no sign-up form: accounts are
 * created by invitation from the Supabase dashboard, and the database trigger
 * gives every new account the read-only `committee` role. Letting the browser
 * pick its own role would make Row Level Security decorative.
 */
/**
 * Sets a password on an account that arrived through an invite or reset link.
 * Those links sign you in but leave no usable password, so without this the only
 * way back in is another emailed link.
 */
function SetPasswordForm() {
  const { setPassword } = useStore();
  const [value, setValue] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [state, setState] = React.useState<{ tone: 'error' | 'ok'; text: string } | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (value !== confirm) {
      setState({ tone: 'error', text: 'The two passwords do not match.' });
      return;
    }
    setBusy(true);
    const err = await setPassword(value);
    setBusy(false);
    if (err) {
      setState({ tone: 'error', text: err });
      return;
    }
    setValue('');
    setConfirm('');
    setState({ tone: 'ok', text: 'Password set. You can sign in with it from now on.' });
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-md border border-hairline/60 bg-surface/50 p-3">
      <div>
        <p className="flex items-center gap-1.5 text-sm font-medium text-brand-800">
          <KeyRound className="h-3.5 w-3.5 text-accent" />
          Set a password
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Do this once after accepting an invite — otherwise every future login needs a new
          emailed link.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          type="password"
          autoComplete="new-password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="New password"
          minLength={12}
          required
          aria-label="New password"
        />
        <Input
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm password"
          minLength={12}
          required
          aria-label="Confirm password"
        />
      </div>

      {state ? (
        <p className={state.tone === 'error' ? 'text-sm text-danger-ink' : 'text-sm text-success-ink'}>
          {state.text}
        </p>
      ) : null}

      <Button type="submit" size="sm" variant="outline" disabled={busy}>
        Save password
      </Button>
    </form>
  );
}

export function AuthPanel() {
  const { mode, auth, signIn, signOut, sendPasswordReset } = useStore();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [message, setMessage] = React.useState<{ tone: 'error' | 'ok'; text: string } | null>(null);
  const [busy, setBusy] = React.useState(false);

  if (mode !== 'supabase') {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <ShieldQuestion className="h-4 w-4 text-accent" />
            Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Local mode has no accounts — there is nothing to sign in to. Connect Supabase to give
            your committee their own logins, with read access enforced by the database rather than
            by the interface.
          </p>
        </CardContent>
      </Card>
    );
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const err = await signIn(email.trim(), password);
    setBusy(false);
    if (err) setMessage({ tone: 'error', text: err });
    else setPassword('');
  }

  async function handleReset() {
    if (!email.trim()) {
      setMessage({ tone: 'error', text: 'Enter your email address first.' });
      return;
    }
    setBusy(true);
    const err = await sendPasswordReset(email.trim());
    setBusy(false);
    setMessage(
      err
        ? { tone: 'error', text: err }
        : { tone: 'ok', text: 'Password reset link sent, if that address has an account.' },
    );
  }

  if (auth.userId) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-success-ink" />
            Signed in
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-ink">{auth.email}</span>
            {auth.profile ? (
              <Badge variant="success">{auth.profile.role}</Badge>
            ) : (
              <Badge variant="danger">no profile row</Badge>
            )}
          </div>

          {!auth.profile ? (
            <p className="rounded-md border border-danger/30 bg-danger-soft p-3 text-sm leading-relaxed text-danger-ink">
              This account has no row in <code>public.profiles</code>, so Row Level Security is
              denying every read. Insert one with the appropriate role, then reload.
            </p>
          ) : null}

          {auth.profile?.role === 'committee' ? (
            <p className="rounded-md border border-warning/30 bg-warning-soft p-3 text-sm leading-relaxed text-warning-ink">
              You have the read-only <strong>committee</strong> role. If this is your own account,
              promote it in the Supabase SQL editor:{' '}
              <code className="text-xs">
                update public.profiles set role = &apos;student&apos; where email = &apos;{auth.email}&apos;;
              </code>
            </p>
          ) : null}

          <SetPasswordForm />

          <Button variant="outline" onClick={() => void signOut()}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <LogIn className="h-4 w-4 text-accent" />
          Sign in
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Invitation only. Until you sign in, this dashboard shows the plan as originally seeded.
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSignIn} className="space-y-3">
          <Field label="Email" htmlFor="auth-email">
            <Input
              id="auth-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field label="Password" htmlFor="auth-password">
            <Input
              id="auth-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>

          {message ? (
            <p
              className={
                message.tone === 'error'
                  ? 'text-sm text-danger-ink'
                  : 'text-sm text-success-ink'
              }
            >
              {message.text}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" disabled={busy}>
              <LogIn className="h-4 w-4" />
              Sign in
            </Button>
            <Button type="button" variant="ghost" onClick={() => void handleReset()} disabled={busy}>
              Forgot password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
