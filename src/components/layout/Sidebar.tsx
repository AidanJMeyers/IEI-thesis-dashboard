'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, CalendarClock } from 'lucide-react';
import { NAV_SECTIONS } from './nav-config';
import { useDeadlines, useWeeks } from '@/hooks/useDashboard';
import { BREATHE_CC_DOCS_URL } from '@/lib/thesis';
import { cn, countdownLabel, formatDateRange } from '@/lib/utils';

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

/** Standing context: which week it is and what is due next. */
function SidebarStatus() {
  const { current } = useWeeks();
  const { next } = useDeadlines();

  if (!current) return null;

  return (
    <div className="mx-3 mb-3 rounded-lg border border-hairline/70 bg-surface p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">
        Week {current.week_number} of 33
      </p>
      <p className="mt-0.5 text-sm font-medium leading-snug text-brand-800">{current.title}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {formatDateRange(current.start_date, current.end_date)}
      </p>
      {next ? (
        <div className="mt-2.5 flex items-start gap-1.5 border-t border-hairline/60 pt-2.5 text-xs">
          <CalendarClock className="mt-px h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="min-w-0 text-muted-foreground">
            <span className="block truncate font-medium text-brand-800">{next.label}</span>
            {countdownLabel(next.date)}
          </span>
        </div>
      ) : null}
    </div>
  );
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col overflow-y-auto bg-white pb-6 pt-3">
      <SidebarStatus />

      {NAV_SECTIONS.map((section) => (
        <div key={section.heading} className="mb-4">
          <p className="px-5 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {section.heading}
          </p>
          <ul className="space-y-0.5 px-2">
            {section.items.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    title={item.description}
                    className={cn(
                      'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                      active
                        ? 'bg-brand-50 font-medium text-brand-800 shadow-[inset_2px_0_0_0_#2E6B8A]'
                        : 'text-slate-600 hover:bg-surface hover:text-brand-800',
                    )}
                  >
                    <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-accent' : 'text-slate-400')} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <div className="mt-auto px-4">
        <a
          href={BREATHE_CC_DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-2 rounded-lg border border-hairline/70 bg-surface p-3 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:bg-brand-50"
        >
          <span className="min-w-0">
            <span className="block font-medium text-brand-800">BREATHE-CC Documentation</span>
            Study protocol, REDCap architecture, and instrument reference.
          </span>
          <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        </a>
      </div>
    </nav>
  );
}
