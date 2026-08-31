'use client';

import * as React from 'react';
import { useStore } from '@/lib/data/store';
import * as select from '@/lib/data/selectors';
import type { Semester, Task, TaskStatus, Priority } from '@/lib/types';

/**
 * Thin, memoised views over the store. Components import from here rather than
 * recomputing derived values in render.
 */

export { useStore };

export function useWeeks() {
  const { weeks, tasks, updateWeek } = useStore();
  return React.useMemo(
    () => ({
      weeks,
      current: select.currentWeek(weeks),
      byPhase: select.weeksByPhase(weeks),
      countsFor: (weekId: number) => select.weekTaskCounts(tasks, weekId),
      updateWeek,
    }),
    [weeks, tasks, updateWeek],
  );
}

export function useWeek(weekNumber: number) {
  const { weeks, tasks } = useStore();
  return React.useMemo(() => {
    const week = weeks.find((w) => w.week_number === weekNumber);
    return {
      week,
      tasks: week ? select.tasksForWeek(tasks, week.id) : [],
      counts: week ? select.weekTaskCounts(tasks, week.id) : { total: 0, done: 0, blocked: 0 },
    };
  }, [weeks, tasks, weekNumber]);
}

export interface TaskFilters {
  componentId?: string | null;
  priority?: Priority | null;
  semester?: Semester | null;
  weekFrom?: number | null;
  weekTo?: number | null;
  search?: string;
}

export function useTasks(filters: TaskFilters = {}) {
  const { tasks, weeks, setTaskStatus, updateTask, deleteTask, addTask, moveTaskToWeek } = useStore();

  const filtered = React.useMemo(() => {
    const weekById = new Map(weeks.map((w) => [w.id, w]));
    return tasks.filter((t) => {
      if (filters.componentId && t.evaluation_component_id !== filters.componentId) return false;
      if (filters.priority && t.priority !== filters.priority) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!t.title.toLowerCase().includes(q) && !(t.description ?? '').toLowerCase().includes(q))
          return false;
      }
      const week = t.week_id != null ? weekById.get(t.week_id) : undefined;
      if (filters.semester) {
        const isFall = week ? week.start_date < '2027-01-01' : false;
        if (filters.semester === 'fall_2026' && !isFall) return false;
        if (filters.semester === 'spring_2027' && isFall) return false;
      }
      if (filters.weekFrom != null && (week?.week_number ?? 0) < filters.weekFrom) return false;
      if (filters.weekTo != null && (week?.week_number ?? 999) > filters.weekTo) return false;
      return true;
    });
  }, [tasks, weeks, filters]);

  const byStatus = React.useMemo(() => {
    const groups: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], blocked: [], done: [] };
    for (const t of select.sortTasks(filtered)) groups[t.status].push(t);
    return groups;
  }, [filtered]);

  return {
    tasks: filtered,
    all: tasks,
    byStatus,
    stats: React.useMemo(() => select.taskStats(filtered), [filtered]),
    overdue: React.useMemo(() => select.overdueTasks(tasks), [tasks]),
    setTaskStatus,
    updateTask,
    deleteTask,
    addTask,
    moveTaskToWeek,
  };
}

export function useEvaluation() {
  const { components, tasks, weeks, files, links, updateComponent } = useStore();
  return React.useMemo(
    () => ({
      components,
      updateComponent,
      fall: select.componentsBySemester(components, 'fall_2026'),
      spring: select.componentsBySemester(components, 'spring_2027'),
      progressFor: (id: string) => {
        const c = components.find((x) => x.id === id);
        return c
          ? select.componentProgress(c, tasks, weeks)
          : { percent: 0, done: 0, total: 0, basis: 'tasks' as const };
      },
      overall: select.weightedProgress({ components, tasks, weeks }),
      fallProgress: select.weightedProgress({ components, tasks, weeks }, 'fall_2026'),
      springProgress: select.weightedProgress({ components, tasks, weeks }, 'spring_2027'),
      filesFor: (id: string) => files.filter((f) => f.evaluation_component_id === id),
      linksFor: (id: string) => links.filter((l) => l.evaluation_component_id === id),
      tasksFor: (id: string) => tasks.filter((t) => t.evaluation_component_id === id),
    }),
    [components, tasks, weeks, files, links, updateComponent],
  );
}

export function useDeadlines(limit = 5) {
  const { components, weeks } = useStore();
  return React.useMemo(
    () => ({
      upcoming: select.upcomingDeadlines({ components, weeks }, limit),
      next: select.nextDeadline({ components, weeks }),
      all: select.allDeadlines({ components, weeks }),
    }),
    [components, weeks, limit],
  );
}

export function useFiles() {
  const { files, links, addFile, deleteFile, addLink, deleteLink, getFileUrl } = useStore();
  return { files, links, addFile, deleteFile, addLink, deleteLink, getFileUrl };
}

export function useMeetings() {
  const store = useStore();
  return React.useMemo(
    () => ({
      meetings: store.meetings,
      ...select.splitMeetings(store.meetings),
      openActions: select.openActionItems(store.meetings),
      addMeeting: store.addMeeting,
      updateMeeting: store.updateMeeting,
      deleteMeeting: store.deleteMeeting,
      toggleActionItem: store.toggleActionItem,
      promoteActionItemToTask: store.promoteActionItemToTask,
    }),
    [store],
  );
}

/**
 * Realtime is wired inside the provider so a single channel serves the whole
 * app. This hook just reports its state for the UI badge.
 */
export function useRealtime() {
  const { mode, ready, error, refresh } = useStore();
  return { live: mode === 'supabase', mode, ready, error, refresh };
}
