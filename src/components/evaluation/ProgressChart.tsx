'use client';

import * as React from 'react';
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Donut } from '@/components/ui/progress';
import { Select } from '@/components/ui/form';
import { useEvaluation } from '@/hooks/useDashboard';
import type { EvaluationComponent, Semester } from '@/lib/types';
import { SEMESTER_LABEL } from '@/lib/utils';

/** Weighted completion donut plus a per-component contribution bar chart. */
export function ProgressChart({
  semester,
  components,
}: {
  semester: Semester;
  components: EvaluationComponent[];
}) {
  const { progressFor, fallProgress, springProgress } = useEvaluation();
  const progress = semester === 'fall_2026' ? fallProgress : springProgress;

  const data = components.map((c) => {
    const p = progressFor(c.id).percent;
    return {
      name: c.name.replace(/^(IEI|Health Outcome|Final Health Outcome)\s+/, ''),
      full: c.name,
      weight: c.weight,
      earned: Math.round((c.weight * p) / 100 * 10) / 10,
      percent: p,
    };
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{SEMESTER_LABEL[semester]} weighted progress</CardTitle>
        <p className="text-xs text-muted-foreground">
          Each bar shows weighted points earned against the points available.
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

          <div className="h-[220px] w-full min-w-0 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 4, right: 16, top: 4, bottom: 4 }}>
                <XAxis
                  type="number"
                  domain={[0, Math.max(...data.map((d) => d.weight), 20)]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  unit="%"
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={132}
                  tick={{ fontSize: 11, fill: '#333333' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#F5F7F9' }}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #CCCCCC',
                    fontSize: 12,
                    boxShadow: '0 4px 14px rgba(33,60,78,0.10)',
                  }}
                  formatter={(value: number, key: string, entry) => {
                    const d = entry.payload as (typeof data)[number];
                    return key === 'earned'
                      ? [`${value} of ${d.weight} pts (${d.percent}%)`, 'Earned']
                      : [`${value} pts`, 'Remaining'];
                  }}
                  labelFormatter={(_, payload) =>
                    (payload?.[0]?.payload as (typeof data)[number] | undefined)?.full ?? ''
                  }
                />
                <Bar dataKey="earned" stackId="w" radius={[0, 0, 0, 0]}>
                  {data.map((d) => (
                    <Cell key={d.full} fill={d.percent === 100 ? '#22c55e' : '#2E6B8A'} />
                  ))}
                </Bar>
                <Bar
                  dataKey={(d: (typeof data)[number]) => Math.round((d.weight - d.earned) * 10) / 10}
                  name="remaining"
                  stackId="w"
                  fill="#e3ebf0"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * "If I finish X at Y quality, where does that land?" — lets Aidan and the
 * committee see the arithmetic instead of guessing at it.
 */
export function GradeSimulator({ components }: { components: EvaluationComponent[] }) {
  const { progressFor } = useEvaluation();
  const [quality, setQuality] = React.useState(90);

  const rows = components.map((c) => {
    const current = progressFor(c.id).percent;
    return { component: c, current };
  });

  const earnedNow = rows.reduce((sum, r) => sum + (r.component.weight * r.current) / 100, 0);
  const totalWeight = rows.reduce((sum, r) => sum + r.component.weight, 0);
  const remainingWeight = totalWeight - earnedNow;
  const projected = earnedNow + (remainingWeight * quality) / 100;
  const projectedPct = totalWeight ? Math.round((projected / totalWeight) * 100) : 0;

  const letter =
    projectedPct >= 93 ? 'A' : projectedPct >= 90 ? 'A−' : projectedPct >= 87 ? 'B+' : projectedPct >= 83 ? 'B' : projectedPct >= 80 ? 'B−' : 'C or below';

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
              {projectedPct}% <span className="text-sm font-normal text-muted-foreground">({letter})</span>
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
                    {Math.round((component.weight * current) / 100 * 10) / 10}
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
