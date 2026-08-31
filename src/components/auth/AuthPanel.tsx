'use client';

import * as React from 'react';
import { LogIn, LogOut, ShieldCheck, ShieldQuestion } from 'lucide-react';
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
