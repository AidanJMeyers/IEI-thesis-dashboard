'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Lock, X } from 'lucide-react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useRealtime, useStore } from '@/hooks/useDashboard';
import { cn } from '@/lib/utils';

/**
 * Signed out against a live database, the dashboard falls back to the seeded
 * plan. It looks entirely legitimate — same layout, same task count — so
 * without this banner a committee member could read a stale plan as current,
 * or try to tick something and get a raw Postgres error back.
 */
function ReadOnlyBanner() {
  const { mode, ready, canEdit, readOnlyReason, auth } = useStore();
  const pathname = usePathname();

  if (!ready || mode !== 'supabase' || canEdit) return null;
  if (pathname.startsWith('/settings')) return null;

  const signedOut = !auth.userId;

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-warning/30 bg-warning-soft px-4 py-2 text-sm text-warning-ink">
      <Lock className="h-4 w-4 shrink-0" />
      <p className="min-w-0 flex-1">{readOnlyReason}</p>
      {signedOut ? (
        <Link href="/settings" className="shrink-0 font-medium underline underline-offset-2">
          Sign in
        </Link>
      ) : null}
    </div>
  );
}

function ErrorBanner() {
  const { error, refresh } = useRealtime();
  const [dismissed, setDismissed] = React.useState(false);
  React.useEffect(() => setDismissed(false), [error]);
  if (!error || dismissed) return null;

  return (
    <div className="flex items-start gap-2 border-b border-danger/30 bg-danger-soft px-4 py-2 text-sm text-danger-ink">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="min-w-0 flex-1">
        <span className="font-medium">Could not reach the database.</span> Showing the plan as
        seeded. {error}
      </p>
      <button onClick={() => void refresh()} className="shrink-0 font-medium underline">
        Retry
      </button>
      <button onClick={() => setDismissed(true)} aria-label="Dismiss" className="shrink-0">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const pathname = usePathname();

  // Close the drawer whenever navigation happens on a phone.
  React.useEffect(() => setSidebarOpen(false), [pathname]);

  return (
    <div className="min-h-screen bg-surface">
      <Navbar onToggleSidebar={() => setSidebarOpen((v) => !v)} sidebarOpen={sidebarOpen} />
      <ReadOnlyBanner />
      <ErrorBanner />

      <div className="flex">
        {/* Desktop rail */}
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 border-r border-hairline/70 lg:block">
          <Sidebar />
        </aside>

        {/* Mobile drawer */}
        <div
          className={cn(
            'fixed inset-0 z-30 lg:hidden',
            sidebarOpen ? 'pointer-events-auto' : 'pointer-events-none',
          )}
          aria-hidden={!sidebarOpen}
        >
          <div
            className={cn(
              'absolute inset-0 bg-brand-950/40 transition-opacity',
              sidebarOpen ? 'opacity-100' : 'opacity-0',
            )}
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className={cn(
              'absolute inset-y-0 left-0 w-64 max-w-[85vw] border-r border-hairline bg-white shadow-lift transition-transform duration-200',
              sidebarOpen ? 'translate-x-0' : '-translate-x-full',
            )}
          >
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </div>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
