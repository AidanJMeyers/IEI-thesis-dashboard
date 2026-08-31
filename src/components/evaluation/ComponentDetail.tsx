'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, Textarea, Field } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ComponentStatusBadge, CountdownTimer } from '@/components/shared/badges';
import { TaskRow } from '@/components/tasks/TaskCard';
import { FileList, FileUploader } from '@/components/files/FileUploader';
import { AddLinkButton, LinkList } from '@/components/files/LinkManager';
import { TaskForm } from '@/components/tasks/TaskForm';
import { useEvaluation } from '@/hooks/useDashboard';
import type { ComponentStatus, EvaluationComponent, Task } from '@/lib/types';
import { cn, COMPONENT_STATUS_LABEL } from '@/lib/utils';

const STATUSES: ComponentStatus[] = ['not_started', 'in_progress', 'submitted', 'graded'];

export function ComponentDetail({
  component,
  readOnly = false,
  defaultOpen = false,
}: {
  component: EvaluationComponent;
  readOnly?: boolean;
  defaultOpen?: boolean;
}) {
  const { progressFor, tasksFor, filesFor, linksFor, updateComponent } = useEvaluation();
  const [open, setOpen] = React.useState(defaultOpen);
  const [notes, setNotes] = React.useState(component.grade_notes ?? '');
  const [editing, setEditing] = React.useState<Task | undefined>();
  const [formOpen, setFormOpen] = React.useState(false);

  const progress = progressFor(component.id);
  const tasks = tasksFor(component.id);
  const files = filesFor(component.id);
  const links = linksFor(component.id);
  const complete = component.status === 'submitted' || component.status === 'graded';

  React.useEffect(() => setNotes(component.grade_notes ?? ''), [component.grade_notes]);

  return (
    <Card className={cn('overflow-hidden', open && 'shadow-lift')}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-surface/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
      >
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md bg-brand-50 text-sm font-semibold tabular-nums text-brand-800">
          {component.weight}%
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-brand-800">{component.name}</span>
            <ComponentStatusBadge status={component.status} />
          </span>
          <span className="mt-1.5 flex flex-wrap items-center gap-3">
            <CountdownTimer dueDate={component.due_date} done={complete} />
            <span className="text-xs text-muted-foreground">
              {progress.basis === 'tasks'
                ? `${progress.done}/${progress.total} linked tasks`
                : progress.basis === 'elapsed'
                  ? `${progress.done}/${progress.total} weeks elapsed`
                  : 'Tracked by status'}
            </span>
          </span>
          <Progress
            value={progress.percent}
            className="mt-2 h-1.5"
            indicatorClassName={progress.percent === 100 ? 'bg-success' : undefined}
          />
        </span>

        <ChevronDown
          className={cn(
            'mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open ? (
        <div className="space-y-5 border-t border-hairline/60 bg-surface/40 p-4">
          {component.description ? (
            <p className="text-sm leading-relaxed text-ink">{component.description}</p>
          ) : null}

          {!readOnly ? (
            <div className="flex flex-wrap items-end gap-3">
              <Field label="Status" className="w-44">
                <Select
                  value={component.status}
                  onChange={(e) =>
                    updateComponent(component.id, { status: e.target.value as ComponentStatus })
                  }
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {COMPONENT_STATUS_LABEL[s]}
                    </option>
                  ))}
                </Select>
              </Field>
              <FileUploader compact target={{ componentId: component.id }} />
              <AddLinkButton target={{ componentId: component.id }} />
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditing(undefined);
                  setFormOpen(true);
                }}
              >
                Task
              </Button>
            </div>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-2">
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Linked tasks ({tasks.length})
              </h4>
              {tasks.length ? (
                <div className="space-y-2">
                  {tasks.map((t) => (
                    <TaskRow
                      key={t.id}
                      task={t}
                      showWeek
                      onEdit={
                        readOnly
                          ? undefined
                          : (task) => {
                              setEditing(task);
                              setFormOpen(true);
                            }
                      }
                    />
                  ))}
                </div>
              ) : (
                <p className="rounded-md border border-dashed border-hairline px-3 py-4 text-sm text-muted-foreground">
                  No tasks linked yet. Link tasks so this component&rsquo;s progress reflects real work
                  rather than a manual status.
                </p>
              )}
            </section>

            <div className="space-y-5">
              <section>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Files ({files.length})
                </h4>
                <FileList
                  files={files}
                  readOnly={readOnly}
                  emptyTitle="No files uploaded yet"
                  emptyDescription="Upload the deliverable here so the committee can open it directly."
                />
              </section>

              <section>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Links ({links.length})
                </h4>
                <LinkList links={links} readOnly={readOnly} />
              </section>
            </div>
          </div>

          <Field
            label="Grade & feedback notes"
            hint={readOnly ? undefined : 'Saved when you click away.'}
          >
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => {
                if (notes !== (component.grade_notes ?? '')) {
                  updateComponent(component.id, { grade_notes: notes || null });
                }
              }}
              readOnly={readOnly}
              placeholder="Committee feedback, grade received, revision requests…"
              className="min-h-[70px] bg-white"
            />
          </Field>
        </div>
      ) : null}

      <TaskForm
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editing}
        defaultComponentId={component.id}
      />
    </Card>
  );
}
