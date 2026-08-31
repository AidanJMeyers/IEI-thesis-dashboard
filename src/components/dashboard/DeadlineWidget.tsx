'use client';

import * as React from 'react';
import Link from 'next/link';
import { CalendarCheck2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { useDeadlines } from '@/hooks/useDashboard';
import { cn, countdownLabel, formatDate, URGENCY_STYLES, urgencyOf } from '@/lib/utils';

export function DeadlineWidget({ limit = 5 }: { limit?: number }) {
  const { upcoming } = useDeadlines(limit);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Upcoming deadlines</CardTitle>
        <p className="text-xs text-muted-foreground">
          Green &gt; 2 weeks · amber within 2 weeks · red within 3 days or overdue
        </p>
      </CardHeader>

      <CardContent className="flex-1">
        {upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarCheck2}
            title="No deadlines ahead"
            description="Every graded component is behind you. Check the evaluation tracker to confirm nothing is unsubmitted."
          />
        ) : (
          <ol className="space-y-1.5">
            {upcoming.map((d) => {
              const urgency = urgencyOf(d.date);
              const style = URGENCY_STYLES[urgency];
              return (
                <li key={d.id}>
                  <Link
                    href={d.href}
                    className="flex items-start gap-3 rounded-md border border-hairline/60 px-3 py-2.5 transition-colors hover:border-brand-300 hover:bg-surface/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', style.dot)} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium leading-snug text-ink">{d.label}</span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        {formatDate(d.date)}
                        <span className={cn('font-medium', style.text)}>{countdownLabel(d.date)}</span>
                      </span>
                    </span>
                    {d.weight ? (
                      <Badge variant="outline" size="sm" className="mt-0.5 shrink-0 tabular-nums">
                        {d.weight}%
                      </Badge>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
