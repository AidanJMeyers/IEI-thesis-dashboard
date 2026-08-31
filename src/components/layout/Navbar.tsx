'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight, HardDrive, Menu, Radio, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRealtime } from '@/hooks/useDashboard';
import { APP_NAME, APP_SUBTITLE, BREATHE_CC_DOCS_URL } from '@/lib/thesis';
import { cn } from '@/lib/utils';

/**
 * The BREATHE-CC documentation dashboard is the companion reference for the
 * study this thesis sits inside. It lives in the header on every page because
 * committee members ask "what is BREATHE-CC?" more than any other question.
 */
function BreatheCcLink({ className }: { className?: string }) {
  return (
    <a
      href={BREATHE_CC_DOCS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group inline-flex items-center gap-1.5 rounded-md border border-white/25 bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:border-white/50 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70',
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
      BREATHE-CC Documentation
      <ArrowUpRight className="h-3.5 w-3.5 opacity-70 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
    </a>
  );
}

function ModeBadge() {
  const { live, mode } = useRealtime();
  const Icon = live ? Radio : HardDrive;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border border-white/20 px-2 py-1 text-[11px] font-medium text-white/85"
      title={
        live
          ? 'Connected to Supabase. Changes sync live to anyone viewing.'
          : 'Local mode: seeded from the plan files and saved in this browser. Add Supabase keys to share it.'
      }
    >
      <Icon className="h-3 w-3" />
      {mode === 'supabase' ? 'Live' : 'Local'}
    </span>
  );
}

export function Navbar({ onToggleSidebar, sidebarOpen }: { onToggleSidebar: () => void; sidebarOpen: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-900/40 bg-brand-800 text-white">
      <div className="flex h-14 items-center gap-3 px-3 sm:px-5">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="text-white hover:bg-white/10 lg:hidden"
          aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        <Link href="/" className="flex min-w-0 items-center gap-2.5 focus-visible:outline-none">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-white/12 text-sm font-semibold tracking-tight">
            IEI
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold leading-tight">{APP_NAME}</span>
            <span className="block truncate text-[11px] italic leading-tight text-white/70">
              {APP_SUBTITLE}
            </span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <BreatheCcLink className="hidden sm:inline-flex" />
          <ModeBadge />
        </div>
      </div>

      {/* On phones the study link gets its own row rather than being squeezed out. */}
      <div className="border-t border-white/10 px-3 py-2 sm:hidden">
        <BreatheCcLink className="w-full justify-center" />
      </div>
    </header>
  );
}

export { BreatheCcLink };
