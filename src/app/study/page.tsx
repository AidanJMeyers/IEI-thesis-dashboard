'use client';

import * as React from 'react';
import {
  ArrowUpRight,
  Ban,
  BookOpen,
  Check,
  CheckCircle2,
  Download,
  FileText,
  Globe,
  Languages,
  Layers,
  ShieldAlert,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, SectionTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CriticalPathPanel } from '@/components/dashboard/CriticalPathPanel';
import { AIMS, BREATHE_CC_DOCS_URL, DATA_CONSTRAINT } from '@/lib/thesis';
import {
  DELIVERABLE_DOCS,
  EVENT_STRUCTURE,
  EXTERNAL_SOURCES,
  FIELDS_WITH_BRANCHING,
  IEI_INPUTS,
  INSTRUMENTS,
  MINIMAL_SET,
  RECONCILIATION,
  REDCAP_EXPORT_DATE,
  REDCAP_VERSION,
  TIME_ACTIVITY_SUPPLEMENT,
  TOTAL_FIELDS,
  TOTAL_IDENTIFIERS,
  COHORT_DESIGN,
  PUBLICATION,
  TRANSLATION_STATUS,
  VERDICT_TOTALS,
  type Verdict,
} from '@/lib/study';
import { cn, formatBytes, formatDateLong, withBasePath } from '@/lib/utils';

/**
 * The published protocol. Committee members ask "what is BREATHE-CC?" more than
 * any other question, and the honest answer is a peer-reviewed paper rather than
 * a paraphrase — so the citation, the article, and the full text sit together at
 * the top of the page. It is open access under CC BY-NC-ND, so hosting the PDF
 * for download is permitted.
 */
function PublicationCard() {
  const authors = PUBLICATION.authors;
  return (
    <Card className="mb-5">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-accent" />
            Published study protocol
          </CardTitle>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="success">{PUBLICATION.articleType}</Badge>
            <Badge variant="outline" size="sm">
              {PUBLICATION.license}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm font-medium leading-snug text-ink">{PUBLICATION.title}</p>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {authors.map((a, i) => (
            <React.Fragment key={a}>
              {i > 0 ? ', ' : ''}
              <span
                className={
                  i === PUBLICATION.studentAuthorIndex ? 'font-semibold text-brand-800' : undefined
                }
              >
                {a}
              </span>
            </React.Fragment>
          ))}
          .
        </p>

        <p className="text-sm text-ink">
          <em>{PUBLICATION.journal}</em> ({PUBLICATION.year}) {PUBLICATION.volume}:
          {PUBLICATION.articleNumber}
          <span className="mx-1.5 text-slate-300">·</span>
          <a
            href={PUBLICATION.doiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            doi:{PUBLICATION.doi}
          </a>
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button asChild>
            <a href={withBasePath(PUBLICATION.pdf)} download>
              <Download className="h-4 w-4" />
              Full text PDF ({formatBytes(PUBLICATION.pdfBytes)})
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href={PUBLICATION.url} target="_blank" rel="noopener noreferrer">
              Read on Springer
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </Button>
        </div>

        <p className="rounded-md border border-warning/30 bg-warning-soft/50 p-2.5 text-xs leading-relaxed text-warning-ink">
          Note for citation: the thesis proposal and the older context notes both say the protocol
          was &ldquo;submitted to BMJ Open 04/03/2026&rdquo;. It was published in{' '}
          {PUBLICATION.journal}, and it is out rather than under review. Cite it from here.
        </p>
      </CardContent>
    </Card>
  );
}

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
            environmental monitoring in a predominantly Hispanic coastal community. Aidan Meyers is
            Project Coordinator and second author on the protocol.
          </p>
          <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
            {COHORT_DESIGN.rationale}
          </p>
          <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
            Architecture below reflects the {REDCAP_VERSION} production export of{' '}
            {formatDateLong(REDCAP_EXPORT_DATE)}.
          </p>
        </CardContent>
      </Card>

      <PublicationCard />

      <section className="mb-5">
        <SectionTitle
          title="Cohort design"
          description="The protocol's own description of how the study runs."
        />
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {COHORT_DESIGN.design.map((d) => (
            <Card key={d.label} className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {d.label}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-brand-800">{d.value}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{d.detail}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-5">
        <SectionTitle
          title="Companion documents"
          description="The written record behind the addition set — committee-ready, and the basis of the IRB modification narrative."
        />
        <div className="grid gap-3 md:grid-cols-2">
          {DELIVERABLE_DOCS.map((doc) => (
            <a
              key={doc.id}
              href={withBasePath(`/deliverables/${doc.file}`)}
              download
              className="group flex items-start gap-3 rounded-lg border border-hairline/70 bg-white p-4 shadow-card transition-all hover:border-accent/60 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded bg-brand-50 text-accent">
                <FileText className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold leading-snug text-brand-800 group-hover:text-accent">
                    {doc.title}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                  {doc.summary}
                </span>
                <span className="mt-1.5 block text-xs text-muted-foreground">
                  Word document · {doc.pages} pages · {formatBytes(doc.bytes)}
                </span>
              </span>
            </a>
          ))}
        </div>
      </section>

      <Tabs defaultValue="architecture">
        <TabsList>
          <TabsTrigger value="architecture">Data architecture</TabsTrigger>
          <TabsTrigger value="iei">IEI inputs</TabsTrigger>
          <TabsTrigger value="supplement">Addition set</TabsTrigger>
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
            <Metric
              label="Drafted Aug 31"
              value={String(TIME_ACTIVITY_SUPPLEMENT.participantFacing)}
              detail="Participant-facing items"
            />
            <Metric
              label="Recommended"
              value={String(MINIMAL_SET.participantFacing)}
              detail={`Median ${MINIMAL_SET.medianSeen} seen after branching`}
              tone="good"
            />
            <Metric
              label="New HIPAA identifiers"
              value={String(MINIMAL_SET.newIdentifiers)}
              detail="Both addresses were already collected"
              tone="good"
            />
            <Metric
              label="Expected IRB route"
              value="Modification"
              detail="2–4 weeks, not a 4–6 week addendum"
              tone="good"
            />
          </div>

          <Card className="border-success/40 bg-success-soft/25">
            <CardContent className="p-4">
              <p className="flex items-start gap-2 text-sm leading-relaxed text-ink">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-ink" />
                <span>
                  <span className="font-semibold">Reconciled Sep 9, 2026.</span> The Aug 31 draft was
                  checked item by item against the production dictionary and against public records.
                  Twenty-two items duplicated live fields, nine were obtainable without asking
                  anyone, and the twelve-field hour grid compressed into three banded questions plus
                  a subtraction. {TIME_ACTIVITY_SUPPLEMENT.status}
                </span>
              </p>
            </CardContent>
          </Card>

          <section>
            <SectionTitle
              title="Where the 61 items went"
              description="Every participant-facing item in the draft, and what replaced it."
            />
            <div className="mb-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <VerdictCard
                verdict="duplicate"
                n={VERDICT_TOTALS.duplicate}
                label="Already in production"
                blurb="Live fields the draft would have collected twice"
              />
              <VerdictCard
                verdict="external"
                n={VERDICT_TOTALS.external}
                label="Public records"
                blurb="Obtainable at better accuracy than parental recall"
              />
              <VerdictCard
                verdict="dropped"
                n={VERDICT_TOTALS.dropped}
                label="Out of scope"
                blurb="Not inputs to a time-weighted exposure index"
              />
              <VerdictCard
                verdict="retained"
                n={VERDICT_TOTALS.retained}
                label="Retained or compressed"
                blurb="Became the 10 items below"
              />
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="bg-brand-800 text-left text-xs uppercase tracking-wide text-white">
                      <th className="px-3 py-2 font-medium">Drafted item(s)</th>
                      <th className="px-3 py-2 text-right font-medium">n</th>
                      <th className="px-3 py-2 font-medium">Verdict</th>
                      <th className="px-3 py-2 font-medium">Covered by, or replaced with</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RECONCILIATION.map((r, i) => (
                      <tr
                        key={r.drafted}
                        className={cn('border-b border-hairline/40 last:border-0', i % 2 === 1 && 'bg-surface/50')}
                      >
                        <td className="px-3 py-2 align-top">
                          <code className="text-xs text-brand-800">{r.drafted}</code>
                        </td>
                        <td className="px-3 py-2 text-right align-top tabular-nums text-muted-foreground">
                          {r.n}
                        </td>
                        <td className="px-3 py-2 align-top">
                          <VerdictBadge verdict={r.verdict} />
                        </td>
                        <td className="px-3 py-2 align-top leading-relaxed text-muted-foreground">
                          {r.replacement}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>

          <section>
            <SectionTitle
              title={`The recommended instrument — ${MINIMAL_SET.formName}`}
              description={`${MINIMAL_SET.participantFacing} participant-facing items, ${MINIMAL_SET.staffCurated} staff-curated fields, ${MINIMAL_SET.calculated} calculated. ${MINIMAL_SET.totalRows} data-dictionary rows against the draft's ${TIME_ACTIVITY_SUPPLEMENT.fields}.`}
            />
            <Card className="overflow-hidden">
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full min-w-[700px] text-sm">
                  <thead>
                    <tr className="bg-brand-800 text-left text-xs uppercase tracking-wide text-white">
                      <th className="px-3 py-2 font-medium">#</th>
                      <th className="px-3 py-2 font-medium">Variable</th>
                      <th className="px-3 py-2 font-medium">Type</th>
                      <th className="px-3 py-2 font-medium">Item</th>
                      <th className="px-3 py-2 font-medium">Shown to</th>
                      <th className="px-3 py-2 font-medium">Model term</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MINIMAL_SET.items.map((item, i) => (
                      <tr
                        key={item.variable}
                        className={cn('border-b border-hairline/40 last:border-0', i % 2 === 1 && 'bg-surface/50')}
                      >
                        <td className="px-3 py-2 tabular-nums text-muted-foreground">{item.n}</td>
                        <td className="px-3 py-2">
                          <code className="text-xs font-medium text-brand-800">{item.variable}</code>
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" size="sm">
                            {item.type}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-ink">{item.item}</td>
                        <td className="px-3 py-2 text-muted-foreground">{item.shownTo}</td>
                        <td className="px-3 py-2 text-muted-foreground">{item.term}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>

          <section>
            <SectionTitle
              title="Answered without asking"
              description="Public records used in place of survey questions."
            />
            <div className="space-y-2">
              {EXTERNAL_SOURCES.map((s) => (
                <Card key={s.source} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="flex min-w-0 items-start gap-2 text-sm font-medium text-brand-800">
                      <Globe className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      {s.source}
                    </p>
                    <Badge variant="default" size="sm">
                      replaces: {s.replaces}
                    </Badge>
                  </div>
                  <p className="mt-1.5 pl-6 text-sm leading-relaxed text-muted-foreground">{s.why}</p>
                </Card>
              ))}
            </div>
          </section>

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
  tone?: 'danger' | 'good';
}) {
  return (
    <Card className={cn('p-4', tone === 'good' && 'border-success/40')}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={cn(
          'mt-1 text-2xl font-semibold tabular-nums',
          tone === 'danger' ? 'text-danger-ink' : tone === 'good' ? 'text-success-ink' : 'text-brand-800',
        )}
      >
        {value}
      </p>
      {detail ? <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p> : null}
    </Card>
  );
}

const VERDICT_STYLE: Record<
  Verdict,
  { label: string; variant: 'danger' | 'accent' | 'muted' | 'success'; accent: string }
> = {
  duplicate: { label: 'Duplicate', variant: 'danger', accent: 'border-danger/40' },
  external: { label: 'External', variant: 'accent', accent: 'border-accent/40' },
  dropped: { label: 'Dropped', variant: 'muted', accent: 'border-hairline' },
  retained: { label: 'Retained', variant: 'success', accent: 'border-success/40' },
};

function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const s = VERDICT_STYLE[verdict];
  return (
    <Badge variant={s.variant} size="sm">
      {s.label}
    </Badge>
  );
}

function VerdictCard({
  verdict,
  n,
  label,
  blurb,
}: {
  verdict: Verdict;
  n: number;
  label: string;
  blurb: string;
}) {
  const s = VERDICT_STYLE[verdict];
  return (
    <Card className={cn('p-4', s.accent)}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-2xl font-semibold tabular-nums text-brand-800">{n}</p>
        <VerdictBadge verdict={verdict} />
      </div>
      <p className="mt-1 text-sm font-medium text-ink">{label}</p>
      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{blurb}</p>
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
