'use client';

import * as React from 'react';
import Link from 'next/link';
import { CalendarClock, GraduationCap, Layers, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useDeadlines, useEvaluation, useWeeks } from '@/hooks/useDashboard';
import { daysElapsed } from '@/lib/data/selectors';
import { cn, countdownLabel, formatDateRange, urgencyOf, URGENCY_STYLES } from '@/lib/utils';

function Stat({
  icon: Icon,
  label,
  value,
  detail,
  href,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  detail?: React.ReactNode;
  href?: string;
  accent?: string;
}) {
  const body = (
    <Card
      className={cn(
        'h-full p-4 transition-shadow',
        href && 'hover:shadow-lift focus-within:shadow-lift',
      )}
    >
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className={cn('h-3.5 w-3.5', accent ?? 'text-accent')} />
        {label}
      </div>
      <div className="mt-2 text-xl font-semibold leading-tight text-brand-800">{value}</div>
      {detail ? <div className="mt-1 text-xs text-muted-foreground">{detail}</div> : null}
    </Card>
  );
  return href ? (
    <Link href={href} className="focus-visible:outline-none">
      {body}
    </Link>
  ) : (
    body
  );
}

export function StatsBar() {
  const { current } = useWeeks();
  const { next } = useDeadlines();
  const { overall } = useEvaluation();
  const { elapsed, total } = daysElapsed();

  const semester = current
    ? current.start_date < '2027-01-01'
      ? 'Fall 2026'
      : 'Spring 2027'
    : '—';
  const course = semester === 'Fall 2026' ? 'HON 498 HD' : 'HON 499 HD';
  const nextUrgency = urgencyOf(next?.date);

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Stat
        icon={Layers}
        label="Current week"
        value={current ? `Week ${current.week_number} of 33` : '—'}
        detail={
          current ? (
            <>
              <span className="font-medium text-ink">{current.title}</span>
              <span className="mx-1.5 text-slate-300">·</span>
              {formatDateRange(current.start_date, current.end_date)}
            </>
          ) : null
        }
        href={current ? `/weeks/${current.week_number}` : undefined}
      />

      <Stat
        icon={CalendarClock}
        label="Next deadline"
        value={
          next ? (
            <span className="flex items-baseline gap-2">
              <span className={URGENCY_STYLES[nextUrgency].text}>{countdownLabel(next.date)}</span>
            </span>
          ) : (
            'Nothing scheduled'
          )
        }
        detail={next ? <span className="line-clamp-2">{next.label}</span> : null}
        href="/evaluation"
        accent={URGENCY_STYLES[nextUrgency].text}
      />

      <Stat
        icon={TrendingUp}
        label="Weighted progress"
        value={`${overall.percent}%`}
        detail={`${overall.earnedWeight} of ${overall.totalWeight} weighted points across both semesters`}
        href="/evaluation"
      />

      <Stat
        icon={GraduationCap}
        label="Semester"
        value={semester}
        detail={
          <>
            {course}
            <span className="mx-1.5 text-slate-300">·</span>
            Day {elapsed} of {total}
          </>
        }
        href="/timeline"
      />
    </div>
  );
}
