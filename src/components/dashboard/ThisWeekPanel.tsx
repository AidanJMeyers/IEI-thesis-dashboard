'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, ListChecks, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Progress } from '@/components/ui/progress';
import { PhaseBadge } from '@/components/shared/badges';
import { TaskRow } from '@/components/tasks/TaskCard';
import { TaskForm } from '@/components/tasks/TaskForm';
import { useWeek, useWeeks } from '@/hooks/useDashboard';
import { sortTasks } from '@/lib/data/selectors';
import type { Task } from '@/lib/types';
import { formatDateRange, pct } from '@/lib/utils';

export function ThisWeekPanel() {
  const { current } = useWeeks();
  const { tasks, counts } = useWeek(current?.week_number ?? 1);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Task | undefined>();

  if (!current) return null;

  const open = sortTasks(tasks.filter((t) => t.status !== 'done'));
  const done = tasks.filter((t) => t.status === 'done');

  function edit(task: Task) {
    setEditing(task);
    setFormOpen(true);
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle>This week</CardTitle>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Week {current.week_number} · {formatDateRange(current.start_date, current.end_date)}
            </p>
          </div>
          <PhaseBadge phase={current.phase} />
        </div>

        <p className="mt-1 text-sm font-medium text-ink">{current.title}</p>

        <div className="mt-2 flex items-center gap-3">
          <Progress value={pct(counts.done, counts.total)} className="h-1.5 flex-1" />
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {counts.done}/{counts.total} done
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-2">
        {tasks.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title="No tasks scheduled for this week"
            description="Add the first one, or pull something forward from a later week."
            action={
              <Button
                size="sm"
                onClick={() => {
                  setEditing(undefined);
                  setFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Add task
              </Button>
            }
          />
        ) : (
          <>
            {open.map((task) => (
              <TaskRow key={task.id} task={task} onEdit={edit} />
            ))}

            {done.length ? (
              <details className="group pt-1">
                <summary className="cursor-pointer list-none text-xs font-medium text-muted-foreground hover:text-brand-800">
                  {done.length} completed this week
                  <span className="ml-1 inline-block transition-transform group-open:rotate-90">›</span>
                </summary>
                <div className="mt-2 space-y-2">
                  {done.map((task) => (
                    <TaskRow key={task.id} task={task} onEdit={edit} />
                  ))}
                </div>
              </details>
            ) : null}
          </>
        )}

        {current.key_decisions.length ? (
          <div className="rounded-md border border-warning/30 bg-warning-soft/60 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-warning-ink">
              Decisions to make this week
            </p>
            <ul className="mt-1.5 space-y-1 text-sm text-ink">
              {current.key_decisions.map((d) => (
                <li key={d} className="flex gap-2">
                  <span className="text-warning-ink">•</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>

      <div className="flex items-center gap-2 border-t border-hairline/60 p-3">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add task
        </Button>
        <Button size="sm" variant="ghost" asChild className="ml-auto">
          <Link href={`/weeks/${current.week_number}`}>
            Open week
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <TaskForm
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editing}
        defaultWeekId={current.id}
      />
    </Card>
  );
}
