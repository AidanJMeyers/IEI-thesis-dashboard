'use client';

import * as React from 'react';
import {
  CheckCircle2,
  FilePlus2,
  FileMinus2,
  Link2,
  Link2Off,
  MessageSquarePlus,
  Pencil,
  Plus,
  StickyNote,
  Target,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { useStore } from '@/hooks/useDashboard';
import type { ActivityAction } from '@/lib/types';
import { formatTimestamp } from '@/lib/utils';

const ICONS: Record<ActivityAction, React.ComponentType<{ className?: string }>> = {
  task_created: Plus,
  task_completed: CheckCircle2,
  task_updated: Pencil,
  task_deleted: Trash2,
  file_uploaded: FilePlus2,
  file_deleted: FileMinus2,
  link_added: Link2,
  link_deleted: Link2Off,
  meeting_logged: MessageSquarePlus,
  meeting_updated: MessageSquarePlus,
  component_updated: Target,
  note_created: StickyNote,
  note_updated: StickyNote,
};

const TONE: Partial<Record<ActivityAction, string>> = {
  task_completed: 'text-success-ink bg-success-soft',
  task_deleted: 'text-danger-ink bg-danger-soft',
  file_deleted: 'text-danger-ink bg-danger-soft',
  link_deleted: 'text-danger-ink bg-danger-soft',
};

export function ActivityFeed({ limit = 10 }: { limit?: number }) {
  const { activity } = useStore();
  const entries = activity.slice(0, limit);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Recent activity</CardTitle>
        <p className="text-xs text-muted-foreground">Everything that has moved, newest first.</p>
      </CardHeader>

      <CardContent className="flex-1">
        {entries.length === 0 ? (
          <EmptyState
            icon={StickyNote}
            title="Nothing logged yet"
            description="Complete a task or upload a deliverable and it will show up here."
          />
        ) : (
          <ol className="relative space-y-3 before:absolute before:bottom-2 before:left-[13px] before:top-2 before:w-px before:bg-hairline/60">
            {entries.map((entry) => {
              const Icon = ICONS[entry.action] ?? Pencil;
              return (
                <li key={entry.id} className="relative flex gap-3">
                  <span
                    className={
                      'z-10 mt-0.5 grid h-[27px] w-[27px] shrink-0 place-items-center rounded-full border border-hairline/60 bg-white ' +
                      (TONE[entry.action] ?? 'text-accent')
                    }
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 flex-1 pt-1">
                    <span className="block text-sm leading-snug text-ink">{entry.details}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(entry.created_at)}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
