import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Priority, TaskStatus, ComponentStatus } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* -------------------------------------------------------------------------- */
/*  Dates                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Dates in this project are plain `YYYY-MM-DD` strings with no timezone.
 * `new Date(str)` would read them as UTC midnight and shift them a day backwards
 * for anyone west of Greenwich, so parse the parts explicitly. A due date should
 * always land on the day it is written.
 */
export function parseDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function toISODate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return [d.getFullYear(), p(d.getMonth() + 1), p(d.getDate())].join('-');
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Mon, Sep 15" — the house date format for this dashboard. */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = parseDate(value);
  return WEEKDAYS[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate();
}

/** "Mon, Sep 15, 2026" for anything that crosses a year boundary. */
export function formatDateLong(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = parseDate(value);
  return formatDate(d) + ', ' + d.getFullYear();
}

export function formatDateRange(start: string, end: string): string {
  const a = parseDate(start);
  const b = parseDate(end);
  const left = MONTHS[a.getMonth()] + ' ' + a.getDate();
  const right =
    a.getMonth() === b.getMonth()
      ? String(b.getDate())
      : MONTHS[b.getMonth()] + ' ' + b.getDate();
  return left + ' – ' + right;
}

export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  const days = Math.round(hrs / 24);
  if (days < 7) return days + 'd ago';
  return formatDateLong(d);
}

export function daysUntil(value: string | Date | null | undefined): number | null {
  if (!value) return null;
  const target = parseDate(value);
  return Math.round((target.getTime() - today().getTime()) / 86400000);
}

export function countdownLabel(value: string | Date | null | undefined): string {
  const d = daysUntil(value);
  if (d === null) return 'No date set';
  if (d === 0) return 'Due today';
  if (d === 1) return 'Due tomorrow';
  if (d < 0) return Math.abs(d) + ' day' + (Math.abs(d) === 1 ? '' : 's') + ' overdue';
  return d + ' days left';
}

/* -------------------------------------------------------------------------- */
/*  Urgency                                                                     */
/* -------------------------------------------------------------------------- */

export type Urgency = 'none' | 'safe' | 'soon' | 'critical' | 'overdue';

export function urgencyOf(dueDate: string | null | undefined, done = false): Urgency {
  if (done) return 'safe';
  const d = daysUntil(dueDate);
  if (d === null) return 'none';
  if (d < 0) return 'overdue';
  if (d < 3) return 'critical';
  if (d <= 14) return 'soon';
  return 'safe';
}

export const URGENCY_STYLES: Record<
  Urgency,
  { dot: string; text: string; chip: string; label: string }
> = {
  none: {
    dot: 'bg-slate-300',
    text: 'text-slate-500',
    chip: 'bg-slate-100 text-slate-600 border-slate-200',
    label: 'No due date',
  },
  safe: {
    dot: 'bg-success',
    text: 'text-success-ink',
    chip: 'bg-success-soft text-success-ink border-success/30',
    label: 'On track',
  },
  soon: {
    dot: 'bg-warning',
    text: 'text-warning-ink',
    chip: 'bg-warning-soft text-warning-ink border-warning/30',
    label: 'Approaching',
  },
  critical: {
    dot: 'bg-danger',
    text: 'text-danger-ink',
    chip: 'bg-danger-soft text-danger-ink border-danger/30',
    label: 'Imminent',
  },
  overdue: {
    dot: 'bg-danger',
    text: 'text-danger-ink',
    chip: 'bg-danger-soft text-danger-ink border-danger/40',
    label: 'Overdue',
  },
};

/* -------------------------------------------------------------------------- */
/*  Labels                                                                      */
/* -------------------------------------------------------------------------- */

export const PRIORITY_LABEL: Record<Priority, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const PRIORITY_RANK: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  blocked: 'Blocked',
  done: 'Done',
};

export const TASK_STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'blocked', 'done'];

export const COMPONENT_STATUS_LABEL: Record<ComponentStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  submitted: 'Submitted',
  graded: 'Graded',
};

export const SEMESTER_LABEL = {
  fall_2026: 'Fall 2026',
  spring_2027: 'Spring 2027',
} as const;

export const PHASE_COLORS: Record<string, string> = {
  'Summer Planning': '#9bb8c8',
  'Fall Semester': '#213c4e',
  'Winter Break': '#6994ab',
  'Spring Semester': '#2E6B8A',
};

/* -------------------------------------------------------------------------- */
/*  Misc                                                                        */
/* -------------------------------------------------------------------------- */

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'id-' + Math.random().toString(36).slice(2) + '-' + Date.now().toString(36);
}

export function clamp(n: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, n));
}

export function pct(part: number, total: number): number {
  if (!total) return 0;
  return clamp(Math.round((part / total) * 100));
}

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  return (n < 10 && i > 0 ? n.toFixed(1) : Math.round(n)) + ' ' + units[i];
}

/** Prefix a public asset path with the GitHub Pages base path when present. */
export function withBasePath(path: string): string {
  return (process.env.NEXT_PUBLIC_BASE_PATH || '') + path;
}
