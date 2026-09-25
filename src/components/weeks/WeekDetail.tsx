'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Flag, Lightbulb, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState, LoadingState } from '@/components/ui/empty-state';
import { Progress } from '@/components/ui/progress';
import { Select } from '@/components/ui/form';
import { PageHeader } from '@/components/layout/PageHeader';
import { PhaseBadge } from '@/components/shared/badges';
import { TaskRow } from '@/components/tasks/TaskCard';
import { TaskForm } from '@/components/tasks/TaskForm';
import { MeetingSection } from './MeetingSection';
import { useStore, useWeek, useWeeks } from '@/hooks/useDashboard';
import { sortTasks } from '@/lib/data/selectors';
import type { Task } from '@/lib/types';
import { formatDateRange, pct } from '@/lib/utils';

export function WeekDetail({ weekNumber }: { weekNumber: number }) {
  const { ready, moveTaskToWeek, canEdit } = useStore();
  const { weeks } = useWeeks();
  const { week, tasks, counts } = useWeek(weekNumber);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Task | undefined>();

  if (!ready) return <LoadingState />;

  if (!week) {
    return (
      <EmptyState
        title={`Week ${weekNumber} is not in the plan`}
        description="The plan runs from Week 1 (Aug 31, 2026) to Week 33 (May 1, 2027)."
        action={
          <Button asChild variant="outline">
            <Link href="/weeks">Back to the planner</Link>
          </Button>
        }
      />
    );
  }

  const prev = weeks.find((w) => w.week_number === weekNumber - 1);
  const next = weeks.find((w) => w.week_number === weekNumber + 1);
  const open = sortTasks(tasks.filter((t) => t.status !== 'done'));
  const done = tasks.filter((t) => t.status === 'done');

  function edit(task: Task) {
    setEditing(task);
    setFormOpen(true);
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/weeks">
            <ArrowLeft className="h-4 w-4" />
            All weeks
          </Link>
        </Button>
        <div className="flex gap-2">
          {prev ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/weeks/${prev.week_number}`}>
                <ArrowLeft className="h-4 w-4" />
                Week {prev.week_number}
              </Link>
            </Button>
          ) : null}
          {next ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/weeks/${next.week_number}`}>
                Week {next.week_number}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <PageHeader
        title={`Week ${week.week_number} — ${week.title}`}
        description={
          <span className="flex flex-wrap items-center gap-2">
            {formatDateRange(week.start_date, week.end_date)}
            <PhaseBadge phase={week.phase} />
            {week.is_current ? (
              <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-white">
                Current week
              </span>
            ) : null}
          </span>
        }
        actions={
          canEdit ? (
            <Button
              onClick={() => {
                setEditing(undefined);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Add task
            </Button>
          ) : null
        }
      />

      {week.deliverables.length ? (
        <div className="mb-5 rounded-lg border border-warning/40 bg-warning-soft/60 p-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-warning-ink">
            <Flag className="h-3.5 w-3.5" />
            Due this week
          </p>
          <ul className="mt-1.5 space-y-1">
            {week.deliverables.map((d) => (
              <li key={d} className="text-sm font-medium text-ink">
                {d}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle>Tasks</CardTitle>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {counts.done}/{counts.total} done
                </span>
              </div>
              <Progress
                value={pct(counts.done, counts.total)}
                className="mt-1 h-1.5"
                indicatorClassName={counts.done === counts.total && counts.total > 0 ? 'bg-success' : undefined}
              />
            </CardHeader>

            <CardContent className="space-y-2">
              {tasks.length === 0 ? (
                <EmptyState
                  title="No tasks in this week yet"
                  description="Add one, or move a task here from another week."
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
                    <div key={task.id} className="flex items-start gap-2">
                      <TaskRow task={task} onEdit={canEdit ? edit : undefined} className="flex-1" />
                      {canEdit ? (
                      <Select
                        value={String(task.week_id ?? '')}
                        onChange={(e) =>
                          moveTaskToWeek(task.id, e.target.value ? Number(e.target.value) : null)
                        }
                        aria-label={`Move "${task.title}" to another week`}
                        className="mt-0.5 hidden w-28 shrink-0 text-xs xl:block"
                        title="Move to another week"
                      >
                        <option value="">Backlog</option>
                        {weeks.map((w) => (
                          <option key={w.id} value={w.id}>
                            Week {w.week_number}
                          </option>
                        ))}
                      </Select>
                      ) : null}
                    </div>
                  ))}

                  {done.length ? (
                    <details className="group pt-1">
                      <summary className="cursor-pointer list-none text-xs font-medium text-muted-foreground hover:text-brand-800">
                        {done.length} completed
                        <span className="ml-1 inline-block transition-transform group-open:rotate-90">
                          ›
                        </span>
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
            </CardContent>
          </Card>

          <MeetingSection week={week} />
        </div>

        <div className="space-y-5">
          {week.key_decisions.length ? (
            <Card className="border-warning/40">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-warning-ink" />
                  Key decisions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {week.key_decisions.map((d) => (
                    <li key={d} className="flex gap-2 text-sm leading-relaxed text-ink">
                      <span className="text-warning-ink">•</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>At a glance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Phase" value={week.phase} />
              <Row label="Dates" value={formatDateRange(week.start_date, week.end_date)} />
              <Row label="Tasks" value={`${counts.done} done · ${counts.total - counts.done} open`} />
              {counts.blocked ? (
                <Row label="Blocked" value={`${counts.blocked}`} tone="text-danger-ink" />
              ) : null}
              <Row label="Meeting" value={week.has_meeting ? 'Monday 2:30 PM' : 'None planned'} />
            </CardContent>
          </Card>
        </div>
      </div>

      <TaskForm open={formOpen} onOpenChange={setFormOpen} task={editing} defaultWeekId={week.id} />
    </>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-hairline/50 pb-1.5 last:border-0 last:pb-0">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={tone ?? 'text-ink'}>{value}</span>
    </div>
  );
}
