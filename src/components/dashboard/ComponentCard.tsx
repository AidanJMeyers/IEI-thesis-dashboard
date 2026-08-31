'use client';

import * as React from 'react';
import { Link2, Paperclip } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select } from '@/components/ui/form';
import { ComponentStatusBadge, CountdownTimer } from '@/components/shared/badges';
import { FileUploader } from '@/components/files/FileUploader';
import { AddLinkButton } from '@/components/files/LinkManager';
import { useEvaluation } from '@/hooks/useDashboard';
import type { ComponentStatus, EvaluationComponent } from '@/lib/types';
import { cn, COMPONENT_STATUS_LABEL } from '@/lib/utils';

const STATUSES: ComponentStatus[] = ['not_started', 'in_progress', 'submitted', 'graded'];

export function ComponentCard({
  component,
  readOnly = false,
  onOpen,
}: {
  component: EvaluationComponent;
  readOnly?: boolean;
  onOpen?: (component: EvaluationComponent) => void;
}) {
  const { progressFor, filesFor, linksFor, updateComponent } = useEvaluation();
  const progress = progressFor(component.id);
  const files = filesFor(component.id);
  const links = linksFor(component.id);

  return (
    <Card className="flex h-full flex-col">
      <div className="flex-1 p-4">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => onOpen?.(component)}
            disabled={!onOpen}
            className={cn(
              'min-w-0 text-left focus-visible:outline-none',
              onOpen && 'hover:text-accent',
            )}
          >
            <h3 className="text-sm font-semibold leading-snug text-brand-800">{component.name}</h3>
          </button>
          <span className="shrink-0 rounded bg-brand-50 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-brand-800">
            {component.weight}%
          </span>
        </div>

        <div className="mt-2.5">
          <CountdownTimer
            dueDate={component.due_date}
            done={component.status === 'submitted' || component.status === 'graded'}
          />
        </div>

        <div className="mt-3">
          <div className="mb-1 flex items-baseline justify-between text-xs">
            <span className="text-muted-foreground">
              {progress.basis === 'tasks'
                ? `${progress.done} of ${progress.total} tasks`
                : progress.basis === 'elapsed'
                  ? `${progress.done} of ${progress.total} weeks elapsed`
                  : COMPONENT_STATUS_LABEL[component.status]}
            </span>
            <span className="font-semibold tabular-nums text-brand-800">{progress.percent}%</span>
          </div>
          <Progress
            value={progress.percent}
            indicatorClassName={progress.percent === 100 ? 'bg-success' : undefined}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {readOnly ? (
            <ComponentStatusBadge status={component.status} />
          ) : (
            <Select
              value={component.status}
              onChange={(e) =>
                updateComponent(component.id, { status: e.target.value as ComponentStatus })
              }
              aria-label={`Status for ${component.name}`}
              className="h-7 w-auto py-0 text-xs"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {COMPONENT_STATUS_LABEL[s]}
                </option>
              ))}
            </Select>
          )}

          {files.length ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Paperclip className="h-3 w-3" />
              {files.length}
            </span>
          ) : null}
          {links.length ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Link2 className="h-3 w-3" />
              {links.length}
            </span>
          ) : null}
        </div>
      </div>

      {!readOnly ? (
        <div className="flex items-center gap-2 border-t border-hairline/60 px-4 py-2.5">
          <FileUploader compact target={{ componentId: component.id }} />
          <AddLinkButton target={{ componentId: component.id }} />
        </div>
      ) : null}
    </Card>
  );
}
