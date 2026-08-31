'use client';

import * as React from 'react';
import { ArrowUpRight, Eye, Printer } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, SectionTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Donut } from '@/components/ui/progress';
import { EmptyState, LoadingState } from '@/components/ui/empty-state';
import { ComponentCard } from '@/components/dashboard/ComponentCard';
import { TimelineBar } from '@/components/dashboard/TimelineBar';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { CriticalPathSummary } from '@/components/dashboard/CriticalPathPanel';
import { FileList } from '@/components/files/FileUploader';
import { useEvaluation, useMeetings, useStore, useWeeks } from '@/hooks/useDashboard';
import { BREATHE_CC_DOCS_URL, COMMITTEE, DATA_CONSTRAINT, EXTERNAL_GUIDANCE, THESIS } from '@/lib/thesis';
import { formatDateLong, formatDateRange } from '@/lib/utils';

export default function CommitteePage() {
  const { ready, files } = useStore();
  const { current } = useWeeks();
  const { fall, spring, overall, fallProgress, springProgress } = useEvaluation();
  const { past } = useMeetings();

  if (!ready) return <LoadingState />;

  const recentFiles = files.slice(0, 6);
  const meetingsWithNotes = past.filter((m) => m.notes?.trim());

  return (
    <>
      <PageHeader
        title="Committee view"
        description={THESIS.title}
        actions={
          <Button variant="outline" onClick={() => window.print()} className="no-print">
            <Printer className="h-4 w-4" />
            Print
          </Button>
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">
            <Eye className="h-3 w-3" />
            Read-only
          </Badge>
          <CriticalPathSummary />
          {current ? (
            <Badge variant="default">
              Week {current.week_number} of 33 · {formatDateRange(current.start_date, current.end_date)}
            </Badge>
          ) : null}
          <a
            href={BREATHE_CC_DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-hairline bg-white px-2 py-0.5 text-xs font-medium text-accent hover:border-accent"
          >
            BREATHE-CC Documentation
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </PageHeader>

      <div className="space-y-5">
        <div className="grid gap-5 lg:grid-cols-[auto_1fr]">
          <Card className="flex flex-col items-center justify-center p-6">
            <Donut value={overall.percent} sublabel="overall, weighted" />
            <div className="mt-4 grid w-full grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Fall 2026</p>
                <p className="text-lg font-semibold tabular-nums text-brand-800">
                  {fallProgress.percent}%
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Spring 2027</p>
                <p className="text-lg font-semibold tabular-nums text-brand-800">
                  {springProgress.percent}%
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Committee</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {COMMITTEE.map((member) => (
                  <div key={member.name} className="border-b border-hairline/50 pb-2.5 last:border-0 last:pb-0">
                    <p className="text-sm font-medium text-brand-800">
                      {member.name}
                      <span className="ml-2 text-xs font-normal text-accent">{member.role}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{member.department}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{member.expertise}</p>
                  </div>
                ))}
                <div className="rounded-md bg-surface p-2.5">
                  <p className="text-sm font-medium text-brand-800">{EXTERNAL_GUIDANCE.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {EXTERNAL_GUIDANCE.role} · {EXTERNAL_GUIDANCE.affiliation}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-info/40 bg-info-soft/30">
              <CardContent className="p-4 text-sm leading-relaxed text-ink">
                <span className="font-semibold">Read progress in this context.</span>{' '}
                {DATA_CONSTRAINT}
              </CardContent>
            </Card>
          </div>
        </div>

        <TimelineBar />

        <section>
          <SectionTitle title="Fall 2026 — HON 498 HD" description={`${fallProgress.percent}% complete by weight`} />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {fall.map((c) => (
              <ComponentCard key={c.id} component={c} readOnly />
            ))}
          </div>
        </section>

        <section>
          <SectionTitle
            title="Spring 2027 — HON 499 HD"
            description={`${springProgress.percent}% complete by weight`}
          />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {spring.map((c) => (
              <ComponentCard key={c.id} component={c} readOnly />
            ))}
          </div>
        </section>

        <section>
          <SectionTitle title="Recent deliverables" description="Files uploaded against evaluation components." />
          {recentFiles.length ? (
            <FileList files={recentFiles} readOnly />
          ) : (
            <EmptyState
              title="No deliverables uploaded yet"
              description="Uploaded files appear here as soon as they are attached to a component."
            />
          )}
        </section>

        <div className="grid gap-5 lg:grid-cols-2">
          <section>
            <SectionTitle title="Meeting history" description="Notes recorded after each sponsor meeting." />
            {meetingsWithNotes.length ? (
              <div className="space-y-2">
                {meetingsWithNotes.slice(0, 8).map((m) => (
                  <Card key={m.id} className="p-4">
                    <p className="text-sm font-medium text-brand-800">{formatDateLong(m.date)}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{m.attendees.join(', ')}</p>
                    {m.agenda ? (
                      <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">Agenda</p>
                    ) : null}
                    {m.agenda ? <p className="text-sm text-ink">{m.agenda}</p> : null}
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink">{m.notes}</p>
                    {m.action_items.length ? (
                      <ul className="mt-2 space-y-1">
                        {m.action_items.map((item, i) => (
                          <li key={i} className="text-xs text-muted-foreground">
                            {item.done ? '☑' : '☐'} {item.item} — {item.owner}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No meeting notes recorded yet"
                description="Notes taken during sponsor meetings appear here."
              />
            )}
          </section>

          <ActivityFeed limit={12} />
        </div>
      </div>
    </>
  );
}
