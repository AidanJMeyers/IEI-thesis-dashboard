'use client';

import * as React from 'react';
import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/form';
import { useStore } from '@/lib/data/store';
import type { Priority, Task, TaskStatus } from '@/lib/types';
import { PRIORITY_LABEL, TASK_STATUS_LABEL, TASK_STATUS_ORDER } from '@/lib/utils';

const PRIORITIES: Priority[] = ['critical', 'high', 'medium', 'low'];

export function TaskForm({
  open,
  onOpenChange,
  task,
  defaultWeekId,
  defaultComponentId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Omit to create a new task. */
  task?: Task;
  defaultWeekId?: number | null;
  defaultComponentId?: string | null;
}) {
  const { weeks, components, addTask, updateTask, deleteTask } = useStore();
  const editing = Boolean(task);

  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [priority, setPriority] = React.useState<Priority>('medium');
  const [status, setStatus] = React.useState<TaskStatus>('todo');
  const [weekId, setWeekId] = React.useState<string>('');
  const [componentId, setComponentId] = React.useState<string>('');
  const [dueDate, setDueDate] = React.useState<string>('');

  // Re-seed the form each time it opens so a stale edit never leaks into a new task.
  React.useEffect(() => {
    if (!open) return;
    const week = weeks.find((w) => w.id === (task?.week_id ?? defaultWeekId));
    setTitle(task?.title ?? '');
    setDescription(task?.description ?? '');
    setPriority(task?.priority ?? 'medium');
    setStatus(task?.status ?? 'todo');
    setWeekId(String(task?.week_id ?? defaultWeekId ?? ''));
    setComponentId(task?.evaluation_component_id ?? defaultComponentId ?? '');
    setDueDate(task?.due_date ?? week?.end_date ?? '');
  }, [open, task, defaultWeekId, defaultComponentId, weeks]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    const payload = {
      title: trimmed,
      description: description.trim() || null,
      priority,
      status,
      week_id: weekId ? Number(weekId) : null,
      evaluation_component_id: componentId || null,
      due_date: dueDate || null,
    };

    if (task) updateTask(task.id, payload);
    else addTask(payload);
    onOpenChange(false);
  }

  function handleDelete() {
    if (!task) return;
    deleteTask(task.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent wide>
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit task' : 'New task'}</DialogTitle>
          <DialogDescription>
            {editing
              ? 'Changes save immediately and appear in the activity feed.'
              : 'Tasks can hang off a week, an evaluation component, or neither.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Title" htmlFor="task-title">
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Annotate 12 sources on time-weighted exposure models"
              autoFocus
              required
            />
          </Field>

          <Field label="Description" htmlFor="task-description">
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional detail, scope, or acceptance criteria."
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Priority" htmlFor="task-priority">
              <Select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_LABEL[p]}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Status" htmlFor="task-status">
              <Select
                id="task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                {TASK_STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {TASK_STATUS_LABEL[s]}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Week" htmlFor="task-week">
              <Select id="task-week" value={weekId} onChange={(e) => setWeekId(e.target.value)}>
                <option value="">Backlog (no week)</option>
                {weeks.map((w) => (
                  <option key={w.id} value={w.id}>
                    Week {w.week_number} — {w.title}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Due date" htmlFor="task-due">
              <Input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </Field>
          </div>

          <Field
            label="Evaluation component"
            htmlFor="task-component"
            hint="Linking a task lets it count toward that component's progress."
          >
            <Select
              id="task-component"
              value={componentId}
              onChange={(e) => setComponentId(e.target.value)}
            >
              <option value="">Not linked</option>
              <optgroup label="Fall 2026">
                {components
                  .filter((c) => c.semester === 'fall_2026')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.weight}%)
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Spring 2027">
                {components
                  .filter((c) => c.semester === 'spring_2027')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.weight}%)
                    </option>
                  ))}
              </optgroup>
            </Select>
          </Field>

          <DialogFooter>
            {editing ? (
              <Button type="button" variant="ghost" onClick={handleDelete} className="sm:mr-auto text-danger-ink hover:bg-danger-soft">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            ) : null}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editing ? 'Save changes' : 'Add task'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
