'use client';

import * as React from 'react';
import { CalendarPlus, Check, ListPlus, Plus, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox, Field, Input, Textarea } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { useMeetings } from '@/hooks/useDashboard';
import type { ActionItem, Meeting, Week } from '@/lib/types';
import { cn, formatDateLong, toISODate, today } from '@/lib/utils';

/** Debounced autosave so typing notes does not write on every keystroke. */
function useAutosave<T>(value: T, onSave: (value: T) => void, delay = 600) {
  const first = React.useRef(true);
  const saved = React.useRef(value);
  React.useEffect(() => {
    if (first.current) {
      first.current = false;
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

export function ActionItemList({ meeting }: { meeting: Meeting }) {
  const { updateMeeting, toggleActionItem, promoteActionItemToTask } = useMeetings();
  const [text, setText] = React.useState('');
  const [owner, setOwner] = React.useState('Aidan');
  const [due, setDue] = React.useState('');

  function add(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    const item: ActionItem = { item: trimmed, owner: owner.trim() || 'Aidan', due: due || null, done: false };
    updateMeeting(meeting.id, { action_items: [...meeting.action_items, item] });
    setText('');
    setDue('');
  }

  function remove(index: number) {
    updateMeeting(meeting.id, {
      action_items: meeting.action_items.filter((_, i) => i !== index),
    });
  }

  return (
    <div className="space-y-2">
      {meeting.action_items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No action items yet. Capture them during the meeting so nothing is reconstructed from
          memory afterwards.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {meeting.action_items.map((item, index) => (
            <li
              key={`${item.item}-${index}`}
              className={cn(
                'flex items-start gap-2.5 rounded-md border border-hairline/60 bg-white px-3 py-2',
                item.done && 'bg-surface/60',
              )}
            >
              <Checkbox
                checked={item.done}
                onCheckedChange={() => toggleActionItem(meeting.id, index)}
                aria-label={`Mark "${item.item}" ${item.done ? 'not done' : 'done'}`}
                className="mt-0.5"
              />
              <div className="min-w-0 flex-1">
                <p className={cn('text-sm text-ink', item.done && 'text-muted-foreground line-through')}>
                  {item.item}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                  <span>{item.owner}</span>
                  {item.due ? (
                    <>
                      <span className="text-slate-300">·</span>
                      <span>due {formatDateLong(item.due)}</span>
                    </>
                  ) : null}
                </p>
              </div>
              {!item.done ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => promoteActionItemToTask(meeting.id, index)}
                  title="Create a task from this action item"
                >
                  <ListPlus className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Make task</span>
                </Button>
              ) : null}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => remove(index)}
                aria-label="Remove action item"
                className="text-slate-400 hover:bg-danger-soft hover:text-danger-ink"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={add} className="flex flex-wrap items-end gap-2 rounded-md bg-surface/70 p-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="New action item…"
          className="min-w-[180px] flex-1"
        />
        <Input
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          placeholder="Owner"
          className="w-28"
        />
        <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="w-40" />
        <Button type="submit" size="sm">
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </form>
    </div>
  );
}

/** Meeting block shown inside a week detail view. */
export function MeetingSection({ week }: { week: Week }) {
  const { meetings, addMeeting, updateMeeting } = useMeetings();
  const meeting = meetings.find((m) => m.week_id === week.id);

  const [agenda, setAgenda] = React.useState(meeting?.agenda ?? week.meeting_agenda ?? '');
  const [notes, setNotes] = React.useState(meeting?.notes ?? '');

  React.useEffect(() => {
    setAgenda(meeting?.agenda ?? week.meeting_agenda ?? '');
    setNotes(meeting?.notes ?? '');
  }, [meeting?.id, meeting?.agenda, meeting?.notes, week.meeting_agenda]);

  useAutosave(agenda, (v) => meeting && updateMeeting(meeting.id, { agenda: v }));
  useAutosave(notes, (v) => meeting && updateMeeting(meeting.id, { notes: v }));

  if (!week.has_meeting && !meeting) {
    return (
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="text-sm text-muted-foreground">
            No meeting planned for this week. The standing slot is Monday 2:30 PM with Dr. Brown.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              addMeeting({ date: week.start_date, week_id: week.id, agenda: week.meeting_agenda })
            }
          >
            <CalendarPlus className="h-4 w-4" />
            Log a meeting
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!meeting) {
    return (
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="text-sm text-muted-foreground">
            A meeting is planned for this week but has no record yet.
          </p>
          <Button
            size="sm"
            onClick={() =>
              addMeeting({ date: week.start_date, week_id: week.id, agenda: week.meeting_agenda })
            }
          >
            <CalendarPlus className="h-4 w-4" />
            Create the record
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isPast = meeting.date <= toISODate(today());

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4 text-accent" />
            Meeting · {formatDateLong(meeting.date)}, 2:30 PM
          </CardTitle>
          <Badge variant={isPast ? 'muted' : 'accent'}>{isPast ? 'Held' : 'Upcoming'}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">{meeting.attendees.join(', ')}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <Field label="Agenda" hint="Pre-filled from the weekly plan. Edit before the meeting.">
          <Textarea value={agenda} onChange={(e) => setAgenda(e.target.value)} className="min-h-[80px]" />
        </Field>

        <Field label="Notes" hint="Autosaves as you type.">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What was decided? What changed? What does Dr. Brown want to see next week?"
            className="min-h-[120px]"
          />
        </Field>

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Check className="h-3.5 w-3.5" />
            Action items
          </p>
          <ActionItemList meeting={meeting} />
        </div>
      </CardContent>
    </Card>
  );
}
