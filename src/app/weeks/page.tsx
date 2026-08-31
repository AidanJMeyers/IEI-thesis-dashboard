'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WeekCard } from '@/components/weeks/WeekCard';
import { useStore, useWeeks } from '@/hooks/useDashboard';
import { PHASE_COLORS, pct } from '@/lib/utils';

export default function WeeksPage() {
  const { ready, tasks } = useStore();
  const { byPhase, weeks, current } = useWeeks();
  const currentRef = React.useRef<HTMLDivElement>(null);

  if (!ready) return <LoadingState />;

  const done = tasks.filter((t) => t.status === 'done').length;

  return (
    <>
      <PageHeader
        title="Weekly planner"
        description={`All ${weeks.length} weeks from Aug 31, 2026 to May 1, 2027, grouped by phase. ${done} of ${tasks.length} tasks complete overall.`}
        actions={
          current ? (
            <Button
              variant="outline"
              onClick={() => currentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            >
              Jump to Week {current.week_number}
            </Button>
          ) : null
        }
      />

      <div className="space-y-8">
        {byPhase.map((group) => {
          const groupTasks = tasks.filter((t) =>
            group.weeks.some((w) => w.id === t.week_id),
          );
          const groupDone = groupTasks.filter((t) => t.status === 'done').length;

          return (
            <section key={group.phase + group.weeks[0].week_number}>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-brand-800">
                  <span
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: PHASE_COLORS[group.phase] ?? '#94a3b8' }}
                  />
                  {group.phase}
                </h2>
                <Badge variant="outline">
                  Weeks {group.weeks[0].week_number}–{group.weeks[group.weeks.length - 1].week_number}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {groupDone}/{groupTasks.length} tasks ({pct(groupDone, groupTasks.length)}%)
                </span>
              </div>

              <div className="space-y-2">
                {group.weeks.map((week) => (
                  <div key={week.id} ref={week.is_current ? currentRef : undefined}>
                    <WeekCard week={week} />
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
