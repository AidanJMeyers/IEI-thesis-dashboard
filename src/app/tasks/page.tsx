'use client';

import * as React from 'react';
import { Plus, Search, X } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Select } from '@/components/ui/form';
import { LoadingState } from '@/components/ui/empty-state';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { TaskForm } from '@/components/tasks/TaskForm';
import { useStore, useTasks, type TaskFilters } from '@/hooks/useDashboard';
import type { Priority, Semester } from '@/lib/types';
import { PRIORITY_LABEL, SEMESTER_LABEL } from '@/lib/utils';

const EMPTY_FILTERS: TaskFilters = {};

export default function TasksPage() {
  const { ready, components, weeks, canEdit } = useStore();
  const [filters, setFilters] = React.useState<TaskFilters>(EMPTY_FILTERS);
  const [formOpen, setFormOpen] = React.useState(false);
  const { byStatus, stats } = useTasks(filters);

  if (!ready) return <LoadingState />;

  const active =
    Object.entries(filters).filter(([, v]) => v !== null && v !== undefined && v !== '').length > 0;

  function set<K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) {
    setFilters((f) => ({ ...f, [key]: value || null }));
  }

  return (
    <>
      <PageHeader
        title="Task board"
        description={`${stats.total} tasks in view — ${stats.done} done, ${stats.in_progress} in progress, ${stats.blocked} blocked.${
          canEdit ? ' Drag a card between columns to change its status.' : ''
        }`}
        actions={
          canEdit ? (
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4" />
              New task
            </Button>
          ) : null
        }
      />

      <Card className="mb-4 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={filters.search ?? ''}
              onChange={(e) => set('search', e.target.value)}
              placeholder="Search tasks…"
              className="pl-8"
              aria-label="Search tasks"
            />
          </div>

          <Select
            value={filters.componentId ?? ''}
            onChange={(e) => set('componentId', e.target.value || null)}
            aria-label="Filter by evaluation component"
            className="w-auto min-w-[170px]"
          >
            <option value="">All components</option>
            {components.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>

          <Select
            value={filters.priority ?? ''}
            onChange={(e) => set('priority', (e.target.value || null) as Priority | null)}
            aria-label="Filter by priority"
            className="w-auto"
          >
            <option value="">All priorities</option>
            {(['critical', 'high', 'medium', 'low'] as Priority[]).map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </Select>

          <Select
            value={filters.semester ?? ''}
            onChange={(e) => set('semester', (e.target.value || null) as Semester | null)}
            aria-label="Filter by semester"
            className="w-auto"
          >
            <option value="">Both semesters</option>
            {(['fall_2026', 'spring_2027'] as Semester[]).map((s) => (
              <option key={s} value={s}>
                {SEMESTER_LABEL[s]}
              </option>
            ))}
          </Select>

          <div className="flex items-center gap-1.5">
            <Select
              value={filters.weekFrom != null ? String(filters.weekFrom) : ''}
              onChange={(e) => set('weekFrom', e.target.value ? Number(e.target.value) : null)}
              aria-label="Week range start"
              className="w-auto"
            >
              <option value="">Week from</option>
              {weeks.map((w) => (
                <option key={w.id} value={w.week_number}>
                  {w.week_number}
                </option>
              ))}
            </Select>
            <span className="text-xs text-muted-foreground">–</span>
            <Select
              value={filters.weekTo != null ? String(filters.weekTo) : ''}
              onChange={(e) => set('weekTo', e.target.value ? Number(e.target.value) : null)}
              aria-label="Week range end"
              className="w-auto"
            >
              <option value="">to</option>
              {weeks.map((w) => (
                <option key={w.id} value={w.week_number}>
                  {w.week_number}
                </option>
              ))}
            </Select>
          </div>

          {active ? (
            <Button variant="ghost" size="sm" onClick={() => setFilters(EMPTY_FILTERS)}>
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          ) : null}
        </div>
      </Card>

      <TaskBoard groups={byStatus} />

      <TaskForm open={formOpen} onOpenChange={setFormOpen} />
    </>
  );
}
