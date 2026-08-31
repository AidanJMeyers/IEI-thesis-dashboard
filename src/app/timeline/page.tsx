'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/empty-state';
import { useDeadlines, useStore, useWeeks } from '@/hooks/useDashboard';
import { componentProgress } from '@/lib/data/selectors';
import type { EvaluationComponent, Week } from '@/lib/types';
import {
  cn,
  formatDateLong,
  PHASE_COLORS,
  parseDate,
  toISODate,
  today,
  urgencyOf,
  URGENCY_STYLES,
} from '@/lib/utils';

type Zoom = 'week' | 'month';

/**
 * Gantt built on CSS grid rather than a charting dependency: 33 week columns,
 * one row per evaluation component, spans drawn from each component's first
 * linked task to its due date.
 */
export default function TimelinePage() {
  const { ready, components, tasks } = useStore();
  const { weeks } = useWeeks();
  const { all } = useDeadlines();
  const [zoom, setZoom] = React.useState<Zoom>('week');
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const sortedWeeks = React.useMemo(
    () => [...weeks].sort((a, b) => a.week_number - b.week_number),
    [weeks],
  );

  // Scroll the current week into view once the plan has loaded.
  React.useEffect(() => {
    if (!ready) return;
    const el = scrollRef.current?.querySelector('[data-current="true"]');
    el?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, [ready]);

  if (!ready) return <LoadingState />;

  const colWidth = zoom === 'week' ? 44 : 20;

  /** Column index (1-based) for a date, clamped into the plan. */
  function columnFor(dateISO: string): number {
    const idx = sortedWeeks.findIndex((w) => dateISO >= w.start_date && dateISO <= w.end_date);
    if (idx >= 0) return idx + 1;
    if (dateISO < sortedWeeks[0].start_date) return 1;
    const after = sortedWeeks.findIndex((w) => w.start_date > dateISO);
    return after >= 0 ? after + 1 : sortedWeeks.length;
  }

  /** A component's bar: from its earliest linked task's week to its due date. */
  function spanFor(component: EvaluationComponent): { start: number; end: number } {
    const linked = tasks.filter((t) => t.evaluation_component_id === component.id);
    const linkedWeeks = linked
      .map((t) => sortedWeeks.find((w) => w.id === t.week_id)?.week_number)
      .filter((n): n is number => typeof n === 'number');

    const semesterWeeks = sortedWeeks.filter((w) =>
      component.semester === 'fall_2026' ? w.start_date < '2027-01-01' : w.start_date >= '2027-01-01',
    );

    const start = linkedWeeks.length
      ? Math.min(...linkedWeeks)
      : (semesterWeeks[0]?.week_number ?? 1);

    const end = component.due_date
      ? columnFor(component.due_date)
      : linkedWeeks.length
        ? Math.max(...linkedWeeks)
        : (semesterWeeks[semesterWeeks.length - 1]?.week_number ?? sortedWeeks.length);

    return { start, end: Math.max(end, start) };
  }

  const todayISO = toISODate(today());
  const todayCol = columnFor(todayISO);

  return (
    <>
      <PageHeader
        title="Timeline"
        description="Every evaluation component drawn across the 33-week plan. Bars run from the first scheduled task to the due date; diamonds mark graded deadlines."
        actions={
          <div className="flex gap-1 rounded-lg border border-hairline/70 bg-surface p-1">
            {(['week', 'month'] as Zoom[]).map((z) => (
              <Button
                key={z}
                size="sm"
                variant={zoom === z ? 'default' : 'ghost'}
                onClick={() => setZoom(z)}
                className="h-7"
              >
                {z === 'week' ? 'Week view' : 'Month view'}
              </Button>
            ))}
          </div>
        }
      />

      <Card className="overflow-hidden">
        <div ref={scrollRef} className="overflow-x-auto scrollbar-thin">
          <div style={{ minWidth: sortedWeeks.length * colWidth + 240 }}>
            {/* Header: phases then week numbers */}
            <div className="sticky top-0 z-20 bg-white">
              <div className="flex border-b border-hairline/60">
                <div className="w-60 shrink-0 border-r border-hairline/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Component
                </div>
                <div className="flex">
                  {phaseRuns(sortedWeeks).map((run) => (
                    <div
                      key={run.phase + run.start}
                      className="overflow-hidden border-r border-white/30 px-1 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-white"
                      style={{
                        width: run.count * colWidth,
                        backgroundColor: PHASE_COLORS[run.phase] ?? '#94a3b8',
                      }}
                    >
                      <span className="truncate">{zoom === 'week' ? run.phase : run.phase.slice(0, 6)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex border-b border-hairline/60">
                <div className="w-60 shrink-0 border-r border-hairline/60" />
                <div className="flex">
                  {sortedWeeks.map((w) => (
                    <div
                      key={w.id}
                      data-current={w.is_current}
                      className={cn(
                        'shrink-0 border-r border-hairline/40 py-1 text-center text-[10px] tabular-nums',
                        w.is_current ? 'bg-danger-soft font-semibold text-danger-ink' : 'text-muted-foreground',
                      )}
                      style={{ width: colWidth }}
                      title={`Week ${w.week_number}: ${w.title}`}
                    >
                      {zoom === 'week' || w.week_number % 2 === 1 ? w.week_number : ''}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rows */}
            {(['fall_2026', 'spring_2027'] as const).map((semester) => (
              <div key={semester}>
                <div className="flex items-center gap-2 border-b border-hairline/50 bg-surface px-3 py-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-brand-800">
                    {semester === 'fall_2026' ? 'Fall 2026 · HON 498 HD' : 'Spring 2027 · HON 499 HD'}
                  </span>
                </div>

                {components
                  .filter((c) => c.semester === semester)
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((component) => {
                    const span = spanFor(component);
                    const progress = componentProgress(component, tasks, weeks).percent;
                    const urgency = urgencyOf(component.due_date);
                    return (
                      <div
                        key={component.id}
                        className="flex border-b border-hairline/40 hover:bg-surface/50"
                      >
                        <div className="w-60 shrink-0 border-r border-hairline/60 px-3 py-2">
                          <Link
                            href="/evaluation"
                            className="block truncate text-xs font-medium text-brand-800 hover:text-accent"
                            title={component.name}
                          >
                            {component.name}
                          </Link>
                          <span className="text-[10px] text-muted-foreground">
                            {component.weight}% · {progress}% done
                          </span>
                        </div>

                        <div className="relative flex" style={{ height: 40 }}>
                          {sortedWeeks.map((w) => (
                            <div
                              key={w.id}
                              className={cn(
                                'shrink-0 border-r border-hairline/25',
                                w.is_current && 'bg-danger-soft/40',
                              )}
                              style={{ width: colWidth }}
                            />
                          ))}

                          <div
                            className="absolute top-1/2 h-3.5 -translate-y-1/2 overflow-hidden rounded-full bg-brand-100"
                            style={{
                              left: (span.start - 1) * colWidth + 3,
                              width: (span.end - span.start + 1) * colWidth - 6,
                            }}
                            title={`${component.name}: weeks ${span.start}–${span.end}`}
                          >
                            <div
                              className={cn(
                                'h-full rounded-full',
                                progress === 100 ? 'bg-success' : 'bg-accent',
                              )}
                              style={{ width: `${progress}%` }}
                            />
                          </div>

                          {component.due_date ? (
                            <span
                              className={cn(
                                'absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2px] border-2 border-white shadow-sm',
                                URGENCY_STYLES[urgency].dot,
                              )}
                              style={{ left: (columnFor(component.due_date) - 0.5) * colWidth }}
                              title={`Due ${formatDateLong(component.due_date)}`}
                            />
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ))}

            {/* Meeting markers */}
            <div className="flex border-b border-hairline/40 bg-surface/40">
              <div className="w-60 shrink-0 border-r border-hairline/60 px-3 py-2 text-xs font-medium text-muted-foreground">
                Meetings with Dr. Brown
              </div>
              <div className="relative flex" style={{ height: 32 }}>
                {sortedWeeks.map((w) => (
                  <div
                    key={w.id}
                    className={cn(
                      'flex shrink-0 items-center justify-center border-r border-hairline/25',
                      w.is_current && 'bg-danger-soft/40',
                    )}
                    style={{ width: colWidth }}
                    title={w.has_meeting ? `Week ${w.week_number} — meeting` : undefined}
                  >
                    {w.has_meeting ? (
                      <Link href={`/weeks/${w.week_number}`} aria-label={`Week ${w.week_number} meeting`}>
                        <span className="block h-2 w-2 rounded-full bg-accent transition-transform hover:scale-150" />
                      </Link>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {/* Today line */}
            <div className="flex">
              <div className="w-60 shrink-0 border-r border-hairline/60 px-3 py-2 text-xs font-semibold text-danger-ink">
                Today
              </div>
              <div className="relative flex" style={{ height: 28 }}>
                {sortedWeeks.map((w) => (
                  <div key={w.id} className="shrink-0 border-r border-hairline/25" style={{ width: colWidth }} />
                ))}
                <span
                  className="absolute top-1 -translate-x-1/2 whitespace-nowrap rounded bg-danger px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white"
                  style={{ left: (todayCol - 0.5) * colWidth }}
                >
                  {formatDateLong(todayISO)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="mt-5">
        <CardHeader className="pb-2">
          <CardTitle>All graded deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-2 sm:grid-cols-2">
            {all.map((d) => {
              const urgency = urgencyOf(d.date);
              return (
                <li key={d.id}>
                  <Link
                    href={d.href}
                    className="flex items-center gap-2.5 rounded-md border border-hairline/60 px-3 py-2 text-sm transition-colors hover:border-brand-300"
                  >
                    <span className={cn('h-2 w-2 shrink-0 rounded-full', URGENCY_STYLES[urgency].dot)} />
                    <span className="min-w-0 flex-1 truncate text-ink">{d.label}</span>
                    {d.weight ? (
                      <Badge variant="outline" size="sm">
                        {d.weight}%
                      </Badge>
                    ) : null}
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {formatDateLong(d.date)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>
    </>
  );
}

function phaseRuns(weeks: Week[]) {
  const runs: Array<{ phase: string; start: number; count: number }> = [];
  for (const w of weeks) {
    const last = runs[runs.length - 1];
    if (last && last.phase === w.phase) last.count += 1;
    else runs.push({ phase: w.phase, start: w.week_number, count: 1 });
  }
  return runs;
}
