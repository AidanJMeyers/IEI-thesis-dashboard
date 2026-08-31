'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDeadlines, useWeeks } from '@/hooks/useDashboard';
import { timelinePosition } from '@/lib/data/selectors';
import { PLAN_END, PLAN_START } from '@/lib/thesis';
import { cn, formatDateLong, PHASE_COLORS, urgencyOf, URGENCY_STYLES } from '@/lib/utils';

/**
 * The whole thesis on one bar: Aug 31 2026 → May 1 2027, coloured by phase, with
 * TODAY marked and every graded deadline flagged. This is the first thing a
 * committee member looks at, so it has to be readable at a glance and on a phone.
 */
export function TimelineBar() {
  const { weeks } = useWeeks();
  const { all } = useDeadlines();
  const todayPct = timelinePosition();

  const phases = React.useMemo(() => {
    const groups: Array<{ phase: string; start: string; end: string }> = [];
    for (const w of [...weeks].sort((a, b) => a.week_number - b.week_number)) {
      const last = groups[groups.length - 1];
      if (last && last.phase === w.phase) last.end = w.end_date;
      else groups.push({ phase: w.phase, start: w.start_date, end: w.end_date });
    }
    return groups;
  }, [weeks]);

  // Only graded components get a flag; deliverable echoes would crowd the bar.
  const flags = all.filter((d) => d.kind === 'component');

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <CardTitle>Thesis timeline</CardTitle>
          <p className="text-xs text-muted-foreground">
            {formatDateLong(PLAN_START)} → {formatDateLong(PLAN_END)}
          </p>
        </div>
      </CardHeader>

      <CardContent className="pb-6">
        {/* Phase bar */}
        <div className="relative">
          <div className="flex h-7 w-full overflow-hidden rounded-md">
            {phases.map((p) => {
              const left = timelinePosition(p.start);
              const right = timelinePosition(p.end);
              const width = Math.max(right - left, 1);
              return (
                <div
                  key={p.phase + p.start}
                  className="flex items-center justify-center overflow-hidden text-[10px] font-medium uppercase tracking-wide text-white/90"
                  style={{ width: `${width}%`, backgroundColor: PHASE_COLORS[p.phase] ?? '#94a3b8' }}
                  title={`${p.phase}: ${formatDateLong(p.start)} – ${formatDateLong(p.end)}`}
                >
                  <span className="truncate px-2">{p.phase}</span>
                </div>
              );
            })}
          </div>

          {/* Progress overlay */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 rounded-l-md bg-white/25"
            style={{ width: `${todayPct}%` }}
            aria-hidden
          />

          {/* TODAY marker */}
          <div
            className="pointer-events-none absolute -top-1 bottom-[-6px] z-10 w-0.5 bg-danger"
            style={{ left: `${todayPct}%` }}
            aria-hidden
          />
          <div
            className="absolute -top-6 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-danger px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white"
            style={{ left: `${todayPct}%` }}
          >
            Today
          </div>

          {/* Deadline flags */}
          <div className="relative mt-1.5 h-4">
            {flags.map((d) => {
              const pos = timelinePosition(d.date);
              const urgency = urgencyOf(d.date);
              return (
                <Link
                  key={d.id}
                  href={d.href}
                  className="group absolute top-0 -translate-x-1/2"
                  style={{ left: `${pos}%` }}
                  title={`${d.label} — ${formatDateLong(d.date)}${d.weight ? ` (${d.weight}%)` : ''}`}
                >
                  <span
                    className={cn(
                      'block h-3 w-3 rotate-45 rounded-[2px] border-2 border-white shadow-sm transition-transform group-hover:scale-125',
                      URGENCY_STYLES[urgency].dot,
                    )}
                  />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
          {Object.entries(PHASE_COLORS)
            .filter(([phase]) => phases.some((p) => p.phase === phase))
            .map(([phase, color]) => (
              <span key={phase} className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} />
                {phase}
              </span>
            ))}
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rotate-45 rounded-[1px] bg-slate-400" />
            Graded deliverable
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
