'use client';

import * as React from 'react';
import {
  ArrowUpRight,
  Ban,
  Check,
  Database,
  Languages,
  Layers,
  ShieldAlert,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, SectionTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CriticalPathPanel } from '@/components/dashboard/CriticalPathPanel';
import { AIMS, BREATHE_CC_DOCS_URL, DATA_CONSTRAINT } from '@/lib/thesis';
import {
  EVENT_STRUCTURE,
  FIELDS_WITH_BRANCHING,
  IEI_INPUTS,
  INSTRUMENTS,
  REDCAP_EXPORT_DATE,
  REDCAP_VERSION,
  TIME_ACTIVITY_SUPPLEMENT,
  TOTAL_FIELDS,
  TOTAL_IDENTIFIERS,
  TRANSLATION_STATUS,
} from '@/lib/study';
import { cn, formatDateLong } from '@/lib/utils';

const FEED_LABEL: Record<string, { label: string; variant: 'default' | 'success' | 'accent' | 'muted' | 'warning' }> = {
  outdoor: { label: 'Outdoor exposure', variant: 'accent' },
  indoor: { label: 'Indoor exposure', variant: 'default' },
  outcome: { label: 'Outcome', variant: 'success' },
  covariate: { label: 'Covariate', variant: 'warning' },
  admin: { label: 'Administrative', variant: 'muted' },
};

export default function StudyPage() {
  return (
    <>
      <PageHeader
        title="BREATHE-CC study context"
        description="The thesis is not a standalone project — it is an analysis layer on a live prospective cohort. This page is the architecture that layer sits on, verified against the production REDCap export."
        actions={
          <a
            href={BREATHE_CC_DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            Full documentation dashboard
            <ArrowUpRight className="h-4 w-4" />
          </a>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Instruments in production" value={String(INSTRUMENTS.length)} detail="REDCap forms" />
        <Metric label="Fields" value={String(TOTAL_FIELDS)} detail={`${FIELDS_WITH_BRANCHING} carry branching logic`} />
        <Metric
          label="Events per participant"
          value={String(EVENT_STRUCTURE.events)}
          detail="Baseline + 18 monthly follow-ups"
        />
        <Metric
          label="HIPAA identifiers"
          value={String(TOTAL_IDENTIFIERS)}
          detail="Across contact, address, and change forms"
        />
      </div>

      <Card className="mb-5 border-info/40 bg-info-soft/30">
        <CardContent className="p-4">
          <p className="text-sm leading-relaxed text-ink">
            <span className="font-semibold">What BREATHE-CC is.</span> A prospective pediatric
            respiratory health cohort run by the Melaram Lab at Texas A&amp;M
            University–Corpus Christi, based at Driscoll Children&rsquo;s Hospital. It follows
            children with asthma through monthly surveys, EHR abstraction, and geospatial
            environmental monitoring in a predominantly Hispanic coastal community. Target
            enrolment is roughly 200 children; the protocol manuscript was submitted to
            BMJ Open on 2026-04-03. Aidan Meyers is Project Coordinator.
          </p>
          <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
            Architecture below reflects the {REDCAP_VERSION} production export of{' '}
            {formatDateLong(REDCAP_EXPORT_DATE)}.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="architecture">
        <TabsList>
          <TabsTrigger value="architecture">Data architecture</TabsTrigger>
          <TabsTrigger value="iei">IEI inputs</TabsTrigger>
          <TabsTrigger value="supplement">Time-Activity Supplement</TabsTrigger>
          <TabsTrigger value="aims">Thesis aims</TabsTrigger>
        </TabsList>

        {/* ---------------------------------------------------------------- */}
        <TabsContent value="architecture" className="space-y-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-accent" />
                Longitudinal structure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-ink">
                <span className="font-medium">{EVENT_STRUCTURE.arms} arm</span>,{' '}
                <span className="font-medium">{EVENT_STRUCTURE.events} events</span>.{' '}
                {EVENT_STRUCTURE.baseline}, then {EVENT_STRUCTURE.followups}.
              </p>
              <p className="leading-relaxed text-muted-foreground">{EVENT_STRUCTURE.note}</p>
            </CardContent>
          </Card>

          <section>
            <SectionTitle
              title="Instruments"
              description="Every production form, what it holds, and what the IEI takes from it."
            />
            <div className="space-y-2">
              {INSTRUMENTS.map((inst) => {
                const feed = FEED_LABEL[inst.feeds];
                return (
                  <Card key={inst.name} className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-brand-800">{inst.label}</h3>
                        <code className="text-[11px] text-muted-foreground">{inst.name}</code>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={feed.variant}>{feed.label}</Badge>
                        <Badge variant="outline" size="sm">
                          {inst.fields} fields
                        </Badge>
                        {inst.identifiers ? (
                          <Badge variant="danger" size="sm">
                            <ShieldAlert className="h-3 w-3" />
                            {inst.identifiers} identifiers
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{inst.ieiRole}</p>
                  </Card>
                );
              })}
            </div>
          </section>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-4 w-4 text-accent" />
                Spanish translation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-relaxed">
              <p className="font-medium text-ink">{TRANSLATION_STATUS.headline}</p>
              <p className="text-muted-foreground">{TRANSLATION_STATUS.detail}</p>
              <p className="rounded-md border border-warning/30 bg-warning-soft/60 p-3 text-warning-ink">
                {TRANSLATION_STATUS.supplement}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------------------- */}
        <TabsContent value="iei" className="space-y-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            The IEI is a time-weighted composite:{' '}
            <code className="rounded bg-surface px-1.5 py-0.5 text-xs text-brand-800">
              IEI_i = Σ_j (f_ij × C_ij)
            </code>{' '}
            where <em>f</em> is the fraction of time in microenvironment <em>j</em> and{' '}
            <em>C</em> is the concentration there, with indoor concentrations modelled as{' '}
            <code className="rounded bg-surface px-1.5 py-0.5 text-xs text-brand-800">
              C_indoor = F_inf × C_ambient + C_source
            </code>
            . Below is which of those terms can be estimated today.
          </p>

          <div className="grid gap-3 lg:grid-cols-2">
            <div>
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-success-ink">
                <Check className="h-4 w-4" />
                Available now ({IEI_INPUTS.filter((i) => i.available).length})
              </h3>
              <div className="space-y-2">
                {IEI_INPUTS.filter((i) => i.available).map((input) => (
                  <InputCard key={input.id} input={input} />
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-danger-ink">
                <Ban className="h-4 w-4" />
                Blocked on the supplement ({IEI_INPUTS.filter((i) => !i.available).length})
              </h3>
              <div className="space-y-2">
                {IEI_INPUTS.filter((i) => !i.available).map((input) => (
                  <InputCard key={input.id} input={input} />
                ))}
              </div>
            </div>
          </div>

          <Card className="border-warning/40 bg-warning-soft/30">
            <CardContent className="p-4 text-sm leading-relaxed text-ink">
              <span className="font-semibold">The gap, stated plainly.</span> Without time-activity
              data the IEI cannot be properly time-weighted. A preliminary index can still be built
              on literature-based time-activity assumptions — and the pipeline is designed to accept
              either source — but the limitation is real and the manuscript should report both
              approaches if participant data arrives in time.
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-sm leading-relaxed text-ink">
              <span className="font-semibold">Data availability.</span> {DATA_CONSTRAINT}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------------------- */}
        <TabsContent value="supplement" className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Fields drafted" value={String(TIME_ACTIVITY_SUPPLEMENT.fields)} detail={`prefix ${TIME_ACTIVITY_SUPPLEMENT.prefix}`} />
            <Metric label="Calculated" value={String(TIME_ACTIVITY_SUPPLEMENT.calculated)} detail="Derived time fractions" />
            <Metric
              label="HIPAA identifiers"
              value={String(TIME_ACTIVITY_SUPPLEMENT.identifiers)}
              detail="School and secondary address"
              tone="danger"
            />
            <Metric label="IRB status" value="Not submitted" detail="Drafted Aug 31, 2026" tone="danger" />
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Database className="h-4 w-4 text-accent" />
                Instrument sections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="grid gap-1.5 sm:grid-cols-2">
                {TIME_ACTIVITY_SUPPLEMENT.sections.map((s, i) => (
                  <li key={s} className="flex items-baseline gap-2 text-sm text-ink">
                    <span className="text-xs tabular-nums text-muted-foreground">{i + 1}.</span>
                    {s}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Derived time-weighting fields</CardTitle>
              <p className="text-xs text-muted-foreground">
                These are the values the IEI actually consumes. Everything else in the instrument
                exists to compute them.
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {TIME_ACTIVITY_SUPPLEMENT.derivedFields.map((f) => (
                  <code
                    key={f}
                    className="rounded border border-hairline/60 bg-surface px-2 py-1 text-xs text-brand-800"
                  >
                    {f}
                  </code>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-danger/40">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-danger-ink">
                <ShieldAlert className="h-4 w-4" />
                Why this is the critical path
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm leading-relaxed text-ink">
                Seven fields collect addresses, which are HIPAA identifiers. If the approved
                BREATHE-CC consent does not already cover geocoding beyond the primary residence,
                the submission becomes a consent addendum rather than a modification — 4–6 weeks
                instead of 2–4.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {TIME_ACTIVITY_SUPPLEMENT.identifierFields.map((f) => (
                  <code
                    key={f}
                    className="rounded border border-danger/30 bg-danger-soft px-2 py-1 text-xs text-danger-ink"
                  >
                    {f}
                  </code>
                ))}
              </div>
            </CardContent>
          </Card>

          <CriticalPathPanel />
        </TabsContent>

        {/* ---------------------------------------------------------------- */}
        <TabsContent value="aims" className="space-y-4">
          {(['aim_1', 'aim_2'] as const).map((key, i) => (
            <Card key={key}>
              <CardHeader className="pb-2">
                <CardTitle>
                  Aim {i + 1} — {AIMS[key].title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-ink">{AIMS[key].description}</p>
              </CardContent>
            </Card>
          ))}
          <Card className="bg-surface/60">
            <CardContent className="p-4 text-sm leading-relaxed text-muted-foreground">
              <span className="font-medium text-brand-800">Scope note.</span> {AIMS.scope_note}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

function Metric({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: 'danger';
}) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={cn(
          'mt-1 text-2xl font-semibold tabular-nums',
          tone === 'danger' ? 'text-danger-ink' : 'text-brand-800',
        )}
      >
        {value}
      </p>
      {detail ? <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p> : null}
    </Card>
  );
}

function InputCard({ input }: { input: (typeof IEI_INPUTS)[number] }) {
  return (
    <div
      className={cn(
        'rounded-md border bg-white p-3',
        input.available ? 'border-success/30' : 'border-danger/30',
      )}
    >
      <p className="flex items-start gap-2 text-sm font-medium text-ink">
        {input.available ? (
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-success-ink" />
        ) : (
          <Ban className="mt-0.5 h-4 w-4 shrink-0 text-danger-ink" />
        )}
        {input.label}
      </p>
      <p className="mt-1 pl-6 text-sm leading-relaxed text-muted-foreground">{input.detail}</p>
      {input.note ? (
        <p className="mt-1.5 pl-6 text-xs font-medium text-warning-ink">{input.note}</p>
      ) : null}
    </div>
  );
}
