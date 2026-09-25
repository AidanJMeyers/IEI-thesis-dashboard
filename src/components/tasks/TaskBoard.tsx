'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { useStore } from '@/lib/data/store';
import type { Task, TaskStatus } from '@/lib/types';
import { cn, TASK_STATUS_LABEL, TASK_STATUS_ORDER } from '@/lib/utils';

const COLUMN_ACCENT: Record<TaskStatus, string> = {
  todo: 'bg-slate-300',
  in_progress: 'bg-accent',
  blocked: 'bg-danger',
  done: 'bg-success',
};

export function TaskBoard({ groups }: { groups: Record<TaskStatus, Task[]> }) {
  const { setTaskStatus, canEdit } = useStore();
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [overColumn, setOverColumn] = React.useState<TaskStatus | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Task | undefined>();
  const [addStatus, setAddStatus] = React.useState<TaskStatus>('todo');

  function handleDrop(status: TaskStatus) {
    if (draggingId) setTaskStatus(draggingId, status);
    setDraggingId(null);
    setOverColumn(null);
  }

  return (
    <>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {TASK_STATUS_ORDER.map((status) => {
          const items = groups[status];
          return (
            <section
              key={status}
              onDragOver={(e) => {
                e.preventDefault();
                setOverColumn(status);
              }}
              onDragLeave={() => setOverColumn((c) => (c === status ? null : c))}
              onDrop={() => handleDrop(status)}
              className={cn(
                'flex min-h-[220px] flex-col rounded-lg border bg-surface/70 p-2.5 transition-colors',
                overColumn === status ? 'border-accent bg-brand-50' : 'border-hairline/60',
              )}
            >
              <header className="mb-2.5 flex items-center gap-2 px-1">
                <span className={cn('h-2 w-2 rounded-full', COLUMN_ACCENT[status])} />
                <h2 className="text-sm font-semibold text-brand-800">{TASK_STATUS_LABEL[status]}</h2>
                <span className="ml-auto rounded-full bg-white px-1.5 text-xs tabular-nums text-muted-foreground">
                  {items.length}
                </span>
              </header>

              <div className="flex-1 space-y-2">
                {items.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    dragging={draggingId === task.id}
                    onDragStart={(e) => {
                      setDraggingId(task.id);
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', task.id);
                    }}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setOverColumn(null);
                    }}
                    onEdit={(t) => {
                      setEditing(t);
                      setFormOpen(true);
                    }}
                  />
                ))}

                {items.length === 0 ? (
                  <p className="rounded-md border border-dashed border-hairline/70 px-3 py-6 text-center text-xs text-muted-foreground">
                    Drag a card here
                  </p>
                ) : null}
              </div>

              {canEdit ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-full justify-start text-muted-foreground"
                  onClick={() => {
                    setEditing(undefined);
                    setAddStatus(status);
                    setFormOpen(true);
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add task
                </Button>
              ) : null}
            </section>
          );
        })}
      </div>

      <TaskForm
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editing}
        key={editing?.id ?? `new-${addStatus}`}
      />
    </>
  );
}
