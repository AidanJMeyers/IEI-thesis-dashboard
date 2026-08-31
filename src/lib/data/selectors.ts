import type {
  DashboardState,
  EvaluationComponent,
  Meeting,
  Semester,
  Task,
  Week,
} from '@/lib/types';
import { PLAN_END, PLAN_START } from '@/lib/thesis';
import { clamp, parseDate, pct, PRIORITY_RANK, toISODate, today } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/*  Weeks                                                                       */
/* -------------------------------------------------------------------------- */

export function currentWeek(weeks: Week[]): Week | undefined {
  return weeks.find((w) => w.is_current) ?? weeks[0];
}

export function weeksByPhase(weeks: Week[]): Array<{ phase: string; weeks: Week[] }> {
  const groups: Array<{ phase: string; weeks: Week[] }> = [];
  for (const w of [...weeks].sort((a, b) => a.week_number - b.week_number)) {
    const last = groups[groups.length - 1];
    if (last && last.phase === w.phase) last.weeks.push(w);
    else groups.push({ phase: w.phase, weeks: [w] });
  }
  return groups;
}

export function tasksForWeek(tasks: Task[], weekId: number): Task[] {
  return tasks
    .filter((t) => t.week_id === weekId)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function weekTaskCounts(tasks: Task[], weekId: number) {
  const list = tasks.filter((t) => t.week_id === weekId);
  return {
    total: list.length,
    done: list.filter((t) => t.status === 'done').length,
    blocked: list.filter((t) => t.status === 'blocked').length,
  };
}

/* -------------------------------------------------------------------------- */
/*  Evaluation components                                                       */
/* -------------------------------------------------------------------------- */

/**
 * A component's progress. Components with linked tasks are measured by task
 * completion; the participation components (which have no tasks) are measured by
 * how far through their semester we are, since attendance accrues with time.
 */
export function componentProgress(
  component: EvaluationComponent,
  tasks: Task[],
  weeks: Week[],
): { percent: number; done: number; total: number; basis: 'tasks' | 'status' | 'elapsed' } {
  const linked = tasks.filter((t) => t.evaluation_component_id === component.id);

  if (component.status === 'graded' || component.status === 'submitted') {
    return { percent: 100, done: linked.length, total: linked.length, basis: 'status' };
  }

  if (linked.length) {
    const done = linked.filter((t) => t.status === 'done').length;
    return { percent: pct(done, linked.length), done, total: linked.length, basis: 'tasks' };
  }

  // Participation-style components: elapsed fraction of their semester.
  const semesterWeeks = weeks.filter((w) =>
    component.semester === 'fall_2026'
      ? w.start_date < '2027-01-01'
      : w.start_date >= '2027-01-01',
  );
  if (!semesterWeeks.length) return { percent: 0, done: 0, total: 0, basis: 'elapsed' };
  const elapsed = semesterWeeks.filter((w) => w.end_date < toISODate(today())).length;
  return { percent: pct(elapsed, semesterWeeks.length), done: elapsed, total: semesterWeeks.length, basis: 'elapsed' };
}

/** Weighted completion across a semester (or the whole thesis when omitted). */
export function weightedProgress(
  state: Pick<DashboardState, 'components' | 'tasks' | 'weeks'>,
  semester?: Semester,
): { percent: number; earnedWeight: number; totalWeight: number } {
  const components = semester
    ? state.components.filter((c) => c.semester === semester)
    : state.components;
  const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);
  const earnedWeight = components.reduce((sum, c) => {
    const p = componentProgress(c, state.tasks, state.weeks).percent;
    return sum + (c.weight * p) / 100;
  }, 0);
  return {
    percent: totalWeight ? clamp(Math.round((earnedWeight / totalWeight) * 100)) : 0,
    earnedWeight: Math.round(earnedWeight * 10) / 10,
    totalWeight,
  };
}

export function componentsBySemester(
  components: EvaluationComponent[],
  semester: Semester,
): EvaluationComponent[] {
  return components
    .filter((c) => c.semester === semester)
    .sort((a, b) => a.sort_order - b.sort_order);
}

/* -------------------------------------------------------------------------- */
/*  Deadlines                                                                   */
/* -------------------------------------------------------------------------- */

export interface Deadline {
  id: string;
  label: string;
  date: string;
  kind: 'component' | 'deliverable' | 'milestone';
  weight?: number;
  href: string;
}

/** Every dated thing the thesis is graded on, in one chronological list. */
export function allDeadlines(state: Pick<DashboardState, 'components' | 'weeks'>): Deadline[] {
  const out: Deadline[] = [];

  for (const c of state.components) {
    if (!c.due_date) continue;
    out.push({
      id: c.id,
      label: c.name,
      date: c.due_date,
      kind: 'component',
      weight: c.weight,
      href: '/evaluation',
    });
  }

  for (const w of state.weeks) {
    for (const d of w.deliverables) {
      // Skip deliverables that just restate a graded component already listed.
      const isComponentEcho = state.components.some(
        (c) => c.due_date && d.toLowerCase().includes(c.name.toLowerCase().slice(0, 14)),
      );
      if (isComponentEcho) continue;
      out.push({
        id: `w${w.week_number}-${d.slice(0, 12)}`,
        label: d,
        date: w.end_date,
        kind: 'deliverable',
        href: `/weeks/${w.week_number}`,
      });
    }
  }

  return out.sort((a, b) => a.date.localeCompare(b.date));
}

export function upcomingDeadlines(
  state: Pick<DashboardState, 'components' | 'weeks'>,
  limit = 5,
): Deadline[] {
  const now = toISODate(today());
  const all = allDeadlines(state);
  const future = all.filter((d) => d.date >= now);
  const overdue = all.filter((d) => d.date < now);
  // Overdue items lead: they are the ones that need a decision.
  return [...overdue.slice(-2), ...future].slice(0, limit);
}

export function nextDeadline(
  state: Pick<DashboardState, 'components' | 'weeks'>,
): Deadline | undefined {
  const now = toISODate(today());
  return allDeadlines(state).find((d) => d.date >= now);
}

/* -------------------------------------------------------------------------- */
/*  Timeline                                                                    */
/* -------------------------------------------------------------------------- */

/** Fraction (0–100) of the way from the plan start to the plan end. */
export function timelinePosition(dateISO?: string): number {
  const start = parseDate(PLAN_START).getTime();
  const end = parseDate(PLAN_END).getTime();
  const at = dateISO ? parseDate(dateISO).getTime() : today().getTime();
  return clamp(((at - start) / (end - start)) * 100, 0, 100);
}

export function daysElapsed(): { elapsed: number; total: number } {
  const start = parseDate(PLAN_START).getTime();
  const end = parseDate(PLAN_END).getTime();
  const total = Math.round((end - start) / 86400000);
  const elapsed = clamp(Math.round((today().getTime() - start) / 86400000), 0, total);
  return { elapsed, total };
}

/* -------------------------------------------------------------------------- */
/*  Tasks                                                                       */
/* -------------------------------------------------------------------------- */

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const p = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (p !== 0) return p;
    if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
    if (a.due_date) return -1;
    if (b.due_date) return 1;
    return a.sort_order - b.sort_order;
  });
}

export function taskStats(tasks: Task[]) {
  return {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    blocked: tasks.filter((t) => t.status === 'blocked').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };
}

export function overdueTasks(tasks: Task[]): Task[] {
  const now = toISODate(today());
  return tasks.filter((t) => t.status !== 'done' && t.due_date && t.due_date < now);
}

/* -------------------------------------------------------------------------- */
/*  Meetings                                                                    */
/* -------------------------------------------------------------------------- */

export function splitMeetings(meetings: Meeting[]) {
  const now = toISODate(today());
  const sorted = [...meetings].sort((a, b) => b.date.localeCompare(a.date));
  return {
    past: sorted.filter((m) => m.date <= now),
    upcoming: sorted.filter((m) => m.date > now).reverse(),
  };
}

export function meetingActionStats(meeting: Meeting) {
  const total = meeting.action_items.length;
  return { total, done: meeting.action_items.filter((a) => a.done).length };
}

export function openActionItems(meetings: Meeting[]) {
  return meetings.flatMap((m) =>
    m.action_items
      .map((item, index) => ({ meeting: m, item, index }))
      .filter((x) => !x.item.done),
  );
}
