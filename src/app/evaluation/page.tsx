'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingState } from '@/components/ui/empty-state';
import { ComponentDetail } from '@/components/evaluation/ComponentDetail';
import { GradeSimulator, ProgressChart } from '@/components/evaluation/ProgressChart';
import { useEvaluation, useStore } from '@/hooks/useDashboard';
import evaluationCriteria from '@context/evaluation-criteria.json';

export default function EvaluationPage() {
  const { ready } = useStore();
  const { fall, spring, overall } = useEvaluation();

  if (!ready) return <LoadingState />;

  return (
    <>
      <PageHeader
        title="Evaluation tracker"
        description={`Twelve graded components across two semesters, ${overall.percent}% complete by weight. Expand any component to attach deliverables, link tasks, and record committee feedback.`}
      />

      <Tabs defaultValue="fall_2026">
        <TabsList>
          <TabsTrigger value="fall_2026">Fall 2026 · HON 498 HD</TabsTrigger>
          <TabsTrigger value="spring_2027">Spring 2027 · HON 499 HD</TabsTrigger>
        </TabsList>

        <TabsContent value="fall_2026" className="space-y-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {evaluationCriteria.fall_2026.description}
          </p>
          <ProgressChart semester="fall_2026" components={fall} />
          <div className="space-y-3">
            {fall.map((c) => (
              <ComponentDetail key={c.id} component={c} />
            ))}
          </div>
          <GradeSimulator components={fall} />
        </TabsContent>

        <TabsContent value="spring_2027" className="space-y-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {evaluationCriteria.spring_2027.description}
          </p>
          <ProgressChart semester="spring_2027" components={spring} />
          <div className="space-y-3">
            {spring.map((c) => (
              <ComponentDetail key={c.id} component={c} />
            ))}
          </div>
          <GradeSimulator components={spring} />
        </TabsContent>
      </Tabs>
    </>
  );
}
