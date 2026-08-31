'use client';

import * as React from 'react';
import Link from 'next/link';
import { CalendarDays, ExternalLink, Trash2, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Field, Input, Textarea } from '@/components/ui/form';
import { ActionItemList } from '@/components/weeks/MeetingSection';
import { useMeetings, useStore } from '@/hooks/useDashboard';
import type { Meeting } from '@/lib/types';
import { formatDateLong, toISODate, today } from '@/lib/utils';

/** Debounced autosave — meeting notes are typed, not submitted. */
function useAutosave<T>(value: T, onSave: (value: T) => void, delay = 600) {
  const first = React.useRef(true);
  const saved = React.useRef(value);
  React.useEffect(() => {
    if (first.current) {
      first.current = false;
      saved.current = value;
      return;
    }
    if (Object.is(saved.current, value)) return;
    const id = setTimeout(() => {
      saved.current = value;
      onSave(value);
    }, delay);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay]);
}

export function MeetingDetail({ meeting }: { meeting: Meeting }) {
  const { updateMeeting, deleteMeeting } = useMeetings();
  const { weeks } = useStore();

  const [agenda, setAgenda] = React.useState(meeting.agenda ?? '');
  const [notes, setNotes] = React.useState(meeting.notes ?? '');
  const [attendees, setAttendees] = React.useState(meeting.attendees.join(', '));

  React.useEffect(() => {
    setAgenda(meeting.agenda ?? '');
    setNotes(meeting.notes ?? '');
    setAttendees(meeting.attendees.join(', '));
  }, [meeting.id, meeting.agenda, meeting.notes, meeting.attendees]);

  useAutosave(agenda, (v) => updateMeeting(meeting.id, { agenda: v }));
  useAutosave(notes, (v) => updateMeeting(meeting.id, { notes: v }));
  useAutosave(attendees, (v) =>
    updateMeeting(meeting.id, {
      attendees: v.split(',').map((s) => s.trim()).filter(Boolean),
    }),
  );

  const week = weeks.find((w) => w.id === meeting.week_id);
  const isPast = meeting.date <= toISODate(today());

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-accent" />
              {formatDateLong(meeting.date)} · 2:30 PM
            </CardTitle>
            {week ? (
              <Link
                href={`/weeks/${week.week_number}`}
                className="mt-1 inline-flex items-center gap-1 text-xs text-accent hover:underline"
              >
                Week {week.week_number} — {week.title}
                <ExternalLink className="h-3 w-3" />
              </Link>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isPast ? 'muted' : 'accent'}>{isPast ? 'Held' : 'Upcoming'}</Badge>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => deleteMeeting(meeting.id)}
              aria-label="Delete meeting"
              className="text-slate-400 hover:bg-danger-soft hover:text-danger-ink"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Field label="Attendees" hint="Comma separated.">
          <Input value={attendees} onChange={(e) => setAttendees(e.target.value)} />
        </Field>

        <Field label="Agenda" hint="Pre-populated from the weekly plan.">
          <Textarea value={agenda} onChange={(e) => setAgenda(e.target.value)} className="min-h-[90px]" />
        </Field>

        <Field label="Notes" hint="Autosaves as you type.">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Decisions, feedback, and anything that changes the plan."
            className="min-h-[160px]"
          />
        </Field>

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            Action items
          </p>
          <ActionItemList meeting={meeting} />
        </div>
      </CardContent>
    </Card>
  );
}

export function MeetingNotFound() {
  return (
    <EmptyState
      title="Meeting not found"
      description="It may have been deleted, or created in a different browser."
      action={
        <Button asChild variant="outline">
          <Link href="/meetings">Back to all meetings</Link>
        </Button>
      }
    />
  );
}
