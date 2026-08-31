'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Donut } from '@/components/ui/progress';
import { Select } from '@/components/ui/form';
import { useEvaluation } from '@/hooks/useDashboard';
import type { EvaluationComponent, Semester } from '@/lib/types';
import { cn, SEMESTER_LABEL } from '@/lib/utils';

/**
 * Weighted completion: a donut for the semester total, then one row per
 * component showing weighted points earned against points available.
 *
 * Built with CSS rather than a charting library. Each row is a single bar whose
 * width is its share of the largest component weight, filled by the proportion
 * earned — so the bars are directly comparable and the arithmetic is visible in
 * the markup. A stacked bar chart added a 100 kB dependency to say the same
 * thing less clearly.
 */
export function ProgressChart({
  semester,
  components,
}: {
  semester: Semester;
  components: EvaluationComponent[];
}) {
  const { progressFor, fallProgress, springProgress } = useEvaluation();
  const progress = semester === 'fall_2026' ? fallProgress : springProgress;

  const rows = components.map((c) => {
    const percent = progressFor(c.id).percent;
    const earned = Math.round(((c.weight * percent) / 100) * 10) / 10;
    return { component: c, percent, earned };
  });

  const maxWeight = Math.max(...rows.map((r) => r.component.weight), 1);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{SEMESTER_LABEL[semester]} weighted progress</CardTitle>
        <p className="text-xs text-muted-foreground">
          Bar length is the component&rsquo;s weight; the filled portion is what is banked.
        </p>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="shrink-0 text-center">
            <Donut
              value={progress.percent}
              sublabel={`${progress.earnedWeight} / ${progress.totalWeight} pts`}
            />
          </div>

          <ul className="w-full min-w-0 flex-1 space-y-2.5">
            {rows.map(({ component, percent, earned }) => (
              <li key={component.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
                <span className="truncate text-sm text-ink" title={component.name}>
                  {component.name}
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  <span className="font-medium text-brand-800">{earned}</span> / {component.weight} pts
                  <span className="ml-1.5 text-slate-400">({percent}%)</span>
                </span>

                <div className="col-span-2 flex h-2.5 w-full items-center">
                  <div
                    className="h-full overflow-hidden rounded-full bg-brand-100"
                    style={{ width: `${(component.weight / maxWeight) * 100}%` }}
                  >
                    <div
                      className={cn(
                        'h-full rounded-full transition-[width] duration-500',
                        percent === 100 ? 'bg-success' : 'bg-accent',
                      )}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * "If I finish everything outstanding at X quality, where does that land?" —
 * shows the arithmetic instead of leaving it to be guessed at.
 */
export function GradeSimulator({ components }: { components: EvaluationComponent[] }) {
  const { progressFor } = useEvaluation();
  const [quality, setQuality] = React.useState(90);

  const rows = components.map((c) => ({ component: c, current: progressFor(c.id).percent }));

  const earnedNow = rows.reduce((sum, r) => sum + (r.component.weight * r.current) / 100, 0);
  const totalWeight = rows.reduce((sum, r) => sum + r.component.weight, 0);
  const remainingWeight = totalWeight - earnedNow;
  const projected = earnedNow + (remainingWeight * quality) / 100;
  const projectedPct = totalWeight ? Math.round((projected / totalWeight) * 100) : 0;

  const letter =
    projectedPct >= 93
      ? 'A'
      : projectedPct >= 90
        ? 'A−'
        : projectedPct >= 87
          ? 'B+'
          : projectedPct >= 83
            ? 'B'
            : projectedPct >= 80
              ? 'B−'
              : 'C or below';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Grade simulator</CardTitle>
        <p className="text-xs text-muted-foreground">
          Assumes everything still outstanding is completed at the quality you pick.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Remaining work completed at
            </span>
            <Select
              value={String(quality)}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-32"
            >
              {[100, 95, 90, 85, 80, 75, 70].map((q) => (
                <option key={q} value={q}>
                  {q}%
                </option>
              ))}
            </Select>
          </label>

          <div className="rounded-md bg-surface px-4 py-2.5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Projected</p>
            <p className="text-xl font-semibold tabular-nums text-brand-800">
              {projectedPct}%{' '}
              <span className="text-sm font-normal text-muted-foreground">({letter})</span>
            </p>
          </div>

          <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
            {Math.round(earnedNow * 10) / 10} weighted points are already banked;{' '}
            {Math.round(remainingWeight * 10) / 10} are still in play.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-hairline/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-2 font-medium">Component</th>
                <th className="pb-2 text-right font-medium">Weight</th>
                <th className="pb-2 text-right font-medium">Now</th>
                <th className="pb-2 text-right font-medium">Banked</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ component, current }) => (
                <tr key={component.id} className="border-b border-hairline/40 last:border-0">
                  <td className="py-1.5 pr-2 text-ink">{component.name}</td>
                  <td className="py-1.5 text-right tabular-nums text-muted-foreground">
                    {component.weight}%
                  </td>
                  <td className="py-1.5 text-right tabular-nums text-muted-foreground">{current}%</td>
                  <td className="py-1.5 text-right font-medium tabular-nums text-brand-800">
                    {Math.round(((component.weight * current) / 100) * 10) / 10}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
