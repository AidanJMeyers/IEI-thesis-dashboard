'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight, Flag, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useWeeks } from '@/hooks/useDashboard';
import type { Week } from '@/lib/types';
import { cn, formatDateRange, pct } from '@/lib/utils';

export function WeekCard({ week }: { week: Week }) {
  const { countsFor } = useWeeks();
  const counts = countsFor(week.id);
  const percent = pct(counts.done, counts.total);

  return (
    <Link
      href={`/weeks/${week.week_number}`}
      className={cn(
        'group flex items-center gap-4 rounded-lg border bg-white px-4 py-3 shadow-card transition-all hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        week.is_current ? 'border-accent ring-1 ring-accent/30' : 'border-hairline/70',
      )}
    >
      <div
        className={cn(
          'grid h-11 w-11 shrink-0 place-items-center rounded-md text-sm font-semibold',
          week.is_current ? 'bg-accent text-white' : 'bg-brand-50 text-brand-800',
        )}
      >
        {week.week_number}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-brand-800">{week.title}</p>
          {week.is_current ? (
            <Badge variant="accent" size="sm">
              Current
            </Badge>
          ) : null}
          {week.has_meeting ? (
            <span
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"
              title="Meeting with Dr. Brown scheduled"
            >
              <Users className="h-3 w-3" />
              Meeting
            </span>
          ) : null}
        </div>

        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatDateRange(week.start_date, week.end_date)}
        </p>

        {week.deliverables.length ? (
          <ul className="mt-1.5 space-y-0.5">
            {week.deliverables.map((d) => (
              <li key={d} className="flex items-start gap-1.5 text-xs font-medium text-warning-ink">
                <Flag className="mt-0.5 h-3 w-3 shrink-0" />
                <span className="min-w-0">{d}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="hidden w-32 shrink-0 sm:block">
        <div className="mb-1 flex items-baseline justify-between text-[11px] text-muted-foreground">
          <span className="tabular-nums">
            {counts.done}/{counts.total}
          </span>
          {counts.blocked ? <span className="text-danger-ink">{counts.blocked} blocked</span> : null}
        </div>
        <Progress
          value={percent}
          className="h-1.5"
          indicatorClassName={percent === 100 ? 'bg-success' : undefined}
        />
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
    </Link>
  );
}
