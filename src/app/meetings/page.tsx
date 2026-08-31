'use client';

import * as React from 'react';
import { CalendarPlus, CheckSquare, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState, LoadingState } from '@/components/ui/empty-state';
import { MeetingDetail } from '@/components/meetings/MeetingDetail';
import { useMeetings, useStore, useWeeks } from '@/hooks/useDashboard';
import { meetingActionStats } from '@/lib/data/selectors';
import type { Meeting } from '@/lib/types';
import { cn, formatDateLong, toISODate, today } from '@/lib/utils';

export default function MeetingsPage() {
  const { ready } = useStore();
  const { meetings, past, upcoming, openActions, addMeeting } = useMeetings();
  const { current } = useWeeks();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  // Default to the meeting nearest to today rather than an arbitrary one.
  const defaultId = React.useMemo(() => {
    if (!meetings.length) return null;
    const now = toISODate(today());
    const sorted = [...meetings].sort((a, b) => a.date.localeCompare(b.date));
    const next = sorted.find((m) => m.date >= now);
    return (next ?? sorted[sorted.length - 1]).id;
  }, [meetings]);

  if (!ready) return <LoadingState />;

  const activeId = selectedId ?? defaultId;
  const active = meetings.find((m) => m.id === activeId);

  return (
    <>
      <PageHeader
        title="Meetings"
        description={`${past.length} held, ${upcoming.length} scheduled. Standing slot is Monday 2:30 PM with Dr. Shan-Estelle Brown, confirmed weekly through September 2026.`}
        actions={
          <Button
            onClick={() => {
              const m = addMeeting({
                date: toISODate(today()),
                week_id: current?.id ?? null,
                agenda: '',
              });
              setSelectedId(m.id);
            }}
          >
            <CalendarPlus className="h-4 w-4" />
            Log a meeting
          </Button>
        }
      />

      {openActions.length ? (
        <Card className="mb-5 border-warning/40">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-warning-ink" />
              {openActions.length} open action {openActions.length === 1 ? 'item' : 'items'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {openActions.slice(0, 6).map(({ meeting, item, index }) => (
                <li key={`${meeting.id}-${index}`} className="flex flex-wrap items-baseline gap-2 text-sm">
                  <button
                    onClick={() => setSelectedId(meeting.id)}
                    className="text-left text-ink hover:text-accent"
                  >
                    {item.item}
                  </button>
                  <span className="text-xs text-muted-foreground">
                    {item.owner}
                    {item.due ? ` · due ${formatDateLong(item.due)}` : ''}
                    {' · from '}
                    {formatDateLong(meeting.date)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <MeetingGroup
            heading="Upcoming"
            meetings={upcoming}
            activeId={activeId}
            onSelect={setSelectedId}
            emptyText="No meetings scheduled ahead."
          />
          <MeetingGroup
            heading="Held"
            meetings={past}
            activeId={activeId}
            onSelect={setSelectedId}
            emptyText="No meetings logged yet."
          />
        </div>

        <div>
          {active ? (
            <MeetingDetail meeting={active} />
          ) : (
            <EmptyState
              title="No meeting selected"
              description="Pick a meeting from the list, or log a new one."
            />
          )}
        </div>
      </div>
    </>
  );
}

function MeetingGroup({
  heading,
  meetings,
  activeId,
  onSelect,
  emptyText,
}: {
  heading: string;
  meetings: Meeting[];
  activeId: string | null;
  onSelect: (id: string) => void;
  emptyText: string;
}) {
  return (
    <section>
      <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {heading}
        <span className="rounded-full bg-surface px-1.5 tabular-nums">{meetings.length}</span>
      </h2>

      {meetings.length === 0 ? (
        <p className="rounded-md border border-dashed border-hairline px-3 py-3 text-xs text-muted-foreground">
          {emptyText}
        </p>
      ) : (
        <ul className="max-h-[420px] space-y-1.5 overflow-y-auto pr-1 scrollbar-thin">
          {meetings.map((m) => {
            const stats = meetingActionStats(m);
            const isActive = m.id === activeId;
            return (
              <li key={m.id}>
                <button
                  onClick={() => onSelect(m.id)}
                  className={cn(
                    'flex w-full items-start gap-2 rounded-md border px-3 py-2.5 text-left transition-colors',
                    isActive
                      ? 'border-accent bg-brand-50'
                      : 'border-hairline/60 bg-white hover:border-brand-300',
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-brand-800">
                      {formatDateLong(m.date)}
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
                      {m.notes?.trim() || m.agenda?.trim() || 'No agenda set'}
                    </span>
                    {stats.total ? (
                      <Badge
                        variant={stats.done === stats.total ? 'success' : 'warning'}
                        size="sm"
                        className="mt-1.5"
                      >
                        {stats.done}/{stats.total} actions
                      </Badge>
                    ) : null}
                  </span>
                  <ChevronRight
                    className={cn('mt-0.5 h-4 w-4 shrink-0', isActive ? 'text-accent' : 'text-slate-300')}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
