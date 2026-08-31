import * as React from 'react';
import Link from 'next/link';
import { AlertTriangle, CircleDashed, CircleDot, CircleCheck, Ban } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  cn,
  countdownLabel,
  COMPONENT_STATUS_LABEL,
  formatDate,
  PRIORITY_LABEL,
  TASK_STATUS_LABEL,
  URGENCY_STYLES,
  urgencyOf,
} from '@/lib/utils';
import type { ComponentStatus, Priority, TaskStatus } from '@/lib/types';

/* ------------------------------ Priority ---------------------------------- */

const PRIORITY_VARIANT: Record<Priority, 'danger' | 'warning' | 'default' | 'muted'> = {
  critical: 'danger',
  high: 'warning',
  medium: 'default',
  low: 'muted',
};

export function PriorityBadge({ priority, size }: { priority: Priority; size?: 'sm' }) {
  return (
    <Badge variant={PRIORITY_VARIANT[priority]} size={size}>
      {PRIORITY_LABEL[priority]}
    </Badge>
  );
}

/* ------------------------------ Task status -------------------------------- */

const TASK_STATUS_ICON: Record<TaskStatus, React.ComponentType<{ className?: string }>> = {
  todo: CircleDashed,
  in_progress: CircleDot,
  blocked: Ban,
  done: CircleCheck,
};

const TASK_STATUS_VARIANT: Record<TaskStatus, 'muted' | 'default' | 'danger' | 'success'> = {
  todo: 'muted',
  in_progress: 'default',
  blocked: 'danger',
  done: 'success',
};

export function StatusBadge({ status, size }: { status: TaskStatus; size?: 'sm' }) {
  const Icon = TASK_STATUS_ICON[status];
  return (
    <Badge variant={TASK_STATUS_VARIANT[status]} size={size}>
      <Icon className="h-3 w-3" />
      {TASK_STATUS_LABEL[status]}
    </Badge>
  );
}

/* --------------------------- Component status ------------------------------ */

const COMPONENT_STATUS_VARIANT: Record<
  ComponentStatus,
  'muted' | 'default' | 'accent' | 'success'
> = {
  not_started: 'muted',
  in_progress: 'default',
  submitted: 'accent',
  graded: 'success',
};

export function ComponentStatusBadge({ status }: { status: ComponentStatus }) {
  return <Badge variant={COMPONENT_STATUS_VARIANT[status]}>{COMPONENT_STATUS_LABEL[status]}</Badge>;
}

/* ------------------------------- Urgency ---------------------------------- */

export function UrgencyIndicator({
  dueDate,
  done = false,
  showLabel = true,
  className,
}: {
  dueDate: string | null | undefined;
  done?: boolean;
  showLabel?: boolean;
  className?: string;
}) {
  const urgency = urgencyOf(dueDate, done);
  const style = URGENCY_STYLES[urgency];
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs', style.text, className)}>
      <span className={cn('h-2 w-2 shrink-0 rounded-full', style.dot)} aria-hidden />
      {showLabel ? <span>{dueDate ? formatDate(dueDate) : 'No due date'}</span> : null}
      {urgency === 'overdue' ? <AlertTriangle className="h-3 w-3" /> : null}
    </span>
  );
}

/** Date plus a live countdown, colour-coded by urgency. */
export function CountdownTimer({
  dueDate,
  done = false,
  compact = false,
  className,
}: {
  dueDate: string | null | undefined;
  done?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const urgency = urgencyOf(dueDate, done);
  const style = URGENCY_STYLES[urgency];

  if (!dueDate) {
    return <span className={cn('text-xs text-slate-400', className)}>No due date</span>;
  }

  if (compact) {
    return (
      <span className={cn('text-xs font-medium tabular-nums', style.text, className)}>
        {countdownLabel(dueDate)}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
        style.chip,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} aria-hidden />
      {formatDate(dueDate)}
      <span className="opacity-60">·</span>
      <span className="tabular-nums">{done ? 'Complete' : countdownLabel(dueDate)}</span>
    </span>
  );
}

/* -------------------------------- Tags ------------------------------------ */

export function WeekTag({ weekNumber }: { weekNumber: number | null | undefined }) {
  if (weekNumber == null) return <Badge variant="outline" size="sm">Backlog</Badge>;
  return (
    <Link href={`/weeks/${weekNumber}`} className="focus-visible:outline-none">
      <Badge variant="outline" size="sm" className="transition-colors hover:border-accent hover:text-accent">
        Week {weekNumber}
      </Badge>
    </Link>
  );
}

export function ComponentTag({ name, weight }: { name: string; weight?: number }) {
  return (
    <Badge variant="default" size="sm" className="max-w-[220px] truncate" title={name}>
      {name}
      {weight != null ? <span className="opacity-70">· {weight}%</span> : null}
    </Badge>
  );
}

export function PhaseBadge({ phase }: { phase: string }) {
  const variant =
    phase === 'Fall Semester' ? 'solid' : phase === 'Spring Semester' ? 'accent' : 'default';
  return <Badge variant={variant as 'solid' | 'accent' | 'default'}>{phase}</Badge>;
}
