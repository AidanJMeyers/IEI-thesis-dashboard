'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SectionTitle } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatsBar } from '@/components/dashboard/StatsBar';
import { TimelineBar } from '@/components/dashboard/TimelineBar';
import { ThisWeekPanel } from '@/components/dashboard/ThisWeekPanel';
import { DeadlineWidget } from '@/components/dashboard/DeadlineWidget';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { ComponentCard } from '@/components/dashboard/ComponentCard';
import { CriticalPathPanel } from '@/components/dashboard/CriticalPathPanel';
import { useEvaluation, useStore } from '@/hooks/useDashboard';
import { THESIS } from '@/lib/thesis';

export default function DashboardHome() {
  const { ready } = useStore();
  const { fall, spring, fallProgress, springProgress } = useEvaluation();

  if (!ready) return <LoadingState />;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={
          <>
            <span className="font-medium text-ink">{THESIS.title}</span>
            <span className="mt-1 block">
              Aidan Meyers · Sponsored by Dr. Shan-Estelle Brown · Rollins College Honors Degree
              Program
            </span>
          </>
        }
      />

      <div className="space-y-5">
        <StatsBar />
        <TimelineBar />

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ThisWeekPanel />
          </div>
          <div className="space-y-5">
            <DeadlineWidget />
          </div>
        </div>

        <CriticalPathPanel />

        <section>
          <SectionTitle
            title="Evaluation components"
            description="Weighted toward the final grade. Progress tracks the tasks linked to each component."
          />
          <Tabs defaultValue="fall_2026">
            <TabsList>
              <TabsTrigger value="fall_2026">
                Fall 2026
                <span className="ml-1 tabular-nums text-xs opacity-70">{fallProgress.percent}%</span>
              </TabsTrigger>
              <TabsTrigger value="spring_2027">
                Spring 2027
                <span className="ml-1 tabular-nums text-xs opacity-70">
                  {springProgress.percent}%
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="fall_2026">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {fall.map((c) => (
                  <ComponentCard key={c.id} component={c} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="spring_2027">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {spring.map((c) => (
                  <ComponentCard key={c.id} component={c} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        <div className="grid gap-5 lg:grid-cols-2">
          <ActivityFeed />
          <PinnedNotes />
        </div>
      </div>
    </>
  );
}

function PinnedNotes() {
  const { notes } = useStore();
  const pinned = notes.filter((n) => n.is_pinned);

  return (
    <div className="rounded-lg border border-hairline/70 bg-white shadow-card">
      <div className="p-4 pb-2 sm:p-5 sm:pb-2">
        <h3 className="text-base font-semibold text-brand-800">Standing notes</h3>
        <p className="text-xs text-muted-foreground">
          The things worth repeating in every committee conversation.
        </p>
      </div>
      <div className="space-y-3 p-4 pt-2 sm:p-5 sm:pt-2">
        {pinned.map((note) => (
          <article key={note.id} className="rounded-md border border-hairline/60 bg-surface/50 p-3">
            <h4 className="text-sm font-semibold text-brand-800">{note.title}</h4>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{note.content}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
