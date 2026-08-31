'use client';

import * as React from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CRITICAL_PATH, DATA_CONSTRAINT } from '@/lib/thesis';
import { countdownLabel, formatDate, urgencyOf, URGENCY_STYLES, cn } from '@/lib/utils';

/**
 * The IRB modification for the Time-Activity Supplement gates the participant-
 * reported time-weighting that Aim 1 depends on, and its turnaround is measured
 * in weeks. It gets its own panel rather than being one task among 124.
 */
export function CriticalPathPanel() {
  return (
    <Card className="border-warning/40">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-warning-soft text-warning-ink">
            <ShieldAlert className="h-4 w-4" />
          </span>
          <div>
            <CardTitle>Critical path — IRB &amp; instrument deployment</CardTitle>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Nothing downstream of these moves until they clear. Estimated turnaround is 2–6 weeks
              depending on whether a consent addendum is required.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2.5">
        {CRITICAL_PATH.map((item) => {
          const urgency = urgencyOf(item.target);
          const style = URGENCY_STYLES[urgency];
          return (
            <div
              key={item.id}
              className="rounded-md border border-hairline/60 bg-white p-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="flex min-w-0 items-start gap-2 text-sm font-medium text-ink">
                  <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', style.dot)} aria-hidden />
                  {item.title}
                </p>
                {item.target ? (
                  <span className={cn('shrink-0 text-xs font-medium tabular-nums', style.text)}>
                    {formatDate(item.target)} · {countdownLabel(item.target)}
                  </span>
                ) : null}
              </div>

              <p className="mt-1.5 pl-4 text-sm leading-relaxed text-muted-foreground">
                {item.detail}
              </p>
              <p className="mt-1.5 pl-4 text-xs text-muted-foreground">
                <span className="font-medium text-brand-800">Blocks:</span> {item.blocks}
              </p>
            </div>
          );
        })}

        <div className="flex items-start gap-2 rounded-md border border-info/30 bg-info-soft/50 p-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <p className="leading-relaxed text-ink">
            <span className="font-medium">Data availability.</span> {DATA_CONSTRAINT}
          </p>
        </div>

        <Link
          href="/study"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
        >
          Full BREATHE-CC study context
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardContent>
    </Card>
  );
}

/** One-line version for the committee view header. */
export function CriticalPathSummary() {
  const open = CRITICAL_PATH.filter((c) => c.status !== 'resolved');
  if (!open.length) return null;
  return (
    <Badge variant="warning">
      <ShieldAlert className="h-3 w-3" />
      {open.length} critical-path {open.length === 1 ? 'item' : 'items'} open
    </Badge>
  );
}
