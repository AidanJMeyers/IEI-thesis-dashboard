'use client';

import * as React from 'react';
import { GripVertical, Link2, Paperclip } from 'lucide-react';
import { Checkbox } from '@/components/ui/form';
import { ComponentTag, CountdownTimer, PriorityBadge, StatusBadge, WeekTag } from '@/components/shared/badges';
import { useStore } from '@/lib/data/store';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';

function useTaskMeta(task: Task) {
  const { components, weeks, files, links } = useStore();
  return React.useMemo(() => {
    const component = components.find((c) => c.id === task.evaluation_component_id);
    const week = weeks.find((w) => w.id === task.week_id);
    return {
      component,
      week,
      fileCount: files.filter((f) => f.task_id === task.id).length,
      linkCount: links.filter((l) => l.task_id === task.id).length,
    };
  }, [components, weeks, files, links, task]);
}

/** Compact row used in week detail and the This Week panel. */
export function TaskRow({
  task,
  onEdit,
  showWeek = false,
  className,
}: {
  task: Task;
  onEdit?: (task: Task) => void;
  showWeek?: boolean;
  className?: string;
}) {
  const { setTaskStatus } = useStore();
  const meta = useTaskMeta(task);
  const done = task.status === 'done';

  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-md border border-hairline/60 bg-white px-3 py-2.5 transition-colors hover:border-brand-300',
        done && 'bg-surface/60',
        task.status === 'blocked' && 'border-danger/30',
        className,
      )}
    >
      <Checkbox
        checked={done}
        onCheckedChange={(checked) => setTaskStatus(task.id, checked ? 'done' : 'todo')}
        aria-label={done ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
        className="mt-0.5"
      />

      <button
        type="button"
        onClick={() => onEdit?.(task)}
        className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        <p
          className={cn(
            'text-sm leading-snug text-ink',
            done && 'text-muted-foreground line-through decoration-slate-300',
          )}
        >
          {task.title}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <PriorityBadge priority={task.priority} size="sm" />
          {task.status !== 'todo' && task.status !== 'done' ? (
            <StatusBadge status={task.status} size="sm" />
          ) : null}
          {meta.component ? <ComponentTag name={meta.component.name} weight={meta.component.weight} /> : null}
          {showWeek ? <WeekTag weekNumber={meta.week?.week_number ?? null} /> : null}
          {meta.fileCount ? (
            <span className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground">
              <Paperclip className="h-3 w-3" />
              {meta.fileCount}
            </span>
          ) : null}
          {meta.linkCount ? (
            <span className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground">
              <Link2 className="h-3 w-3" />
              {meta.linkCount}
            </span>
          ) : null}
        </div>
      </button>

      <CountdownTimer dueDate={task.due_date} done={done} compact className="mt-0.5 shrink-0" />
    </div>
  );
}

/** Draggable card used on the kanban board. */
export function TaskCard({
  task,
  onEdit,
  onDragStart,
  onDragEnd,
  dragging,
}: {
  task: Task;
  onEdit?: (task: Task) => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  dragging?: boolean;
}) {
  const meta = useTaskMeta(task);
  const done = task.status === 'done';

  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        'group cursor-grab rounded-md border border-hairline/70 bg-white p-3 shadow-card transition-shadow active:cursor-grabbing hover:shadow-lift',
        dragging && 'opacity-40',
        task.status === 'blocked' && 'border-l-2 border-l-danger',
        task.priority === 'critical' && task.status !== 'blocked' && 'border-l-2 border-l-danger',
      )}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 group-hover:text-slate-400" />
        <button
          type="button"
          onClick={() => onEdit?.(task)}
          className="min-w-0 flex-1 text-left focus-visible:outline-none"
        >
          <p className={cn('text-sm leading-snug text-ink', done && 'text-muted-foreground')}>
            {task.title}
          </p>
        </button>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pl-6">
        <PriorityBadge priority={task.priority} size="sm" />
        <WeekTag weekNumber={meta.week?.week_number ?? null} />
        {meta.component ? <ComponentTag name={meta.component.name} /> : null}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 pl-6">
        <CountdownTimer dueDate={task.due_date} done={done} compact />
        <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {meta.fileCount ? (
            <span className="inline-flex items-center gap-0.5">
              <Paperclip className="h-3 w-3" />
              {meta.fileCount}
            </span>
          ) : null}
          {meta.linkCount ? (
            <span className="inline-flex items-center gap-0.5">
              <Link2 className="h-3 w-3" />
              {meta.linkCount}
            </span>
          ) : null}
        </span>
      </div>
    </article>
  );
}
