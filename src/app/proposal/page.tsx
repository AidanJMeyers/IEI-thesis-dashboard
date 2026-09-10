'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Download, FileText, Printer } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Aim,
  Erratum,
  Figure,
  FrameworkFigure,
  P,
  RunIn,
  Section,
  SubHeading,
  TableOfContents,
} from '@/components/proposal/ProposalPieces';
import {
  COMMITTEE_TABLE,
  DISCIPLINES,
  PROPOSAL_ERRATA,
  PROPOSAL_META,
  PROPOSED_TIMELINE,
  REFERENCES,
} from '@/lib/proposal';
import { PUBLICATION } from '@/lib/study';
import { withBasePath } from '@/lib/utils';
import evaluationCriteria from '@context/evaluation-criteria.json';

export default function ProposalPage() {
  return (
    <>
      <PageHeader
        title="Interdisciplinary Honors Thesis Proposal"
        description={
          <>
            <span className="font-medium text-ink">{PROPOSAL_META.title}</span>
            <span className="mt-1 block">
              {PROPOSAL_META.program} · {PROPOSAL_META.version} · {PROPOSAL_META.date}
            </span>
          </>
        }
        actions={
          <>
            <Button variant="outline" onClick={() => window.print()} className="no-print">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button asChild>
              <a href={withBasePath('/proposal/Interdisciplinary-Thesis-Proposal-v2.pdf')} download>
                <Download className="h-4 w-4" />
                Original PDF
              </a>
            </Button>
          </>
        }
      />

      {/* Front matter */}
      <Card className="mb-6">
        <CardContent className="grid gap-x-8 gap-y-3 p-5 sm:grid-cols-2">
          <Field label="Student" value={PROPOSAL_META.student} />
          <Field label="Thesis Sponsor" value={PROPOSAL_META.sponsor} />
          <Field
            label="Committee Members"
            value={PROPOSAL_META.committee.join(' · ')}
            className="sm:col-span-2"
          />
          <Field label="Proposed Title" value={PROPOSAL_META.title} className="sm:col-span-2" />
        </CardContent>
      </Card>

      <div className="gap-8 xl:grid xl:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="mb-6 hidden xl:block">
          <TableOfContents />
        </aside>

        <article className="min-w-0 max-w-3xl space-y-8">
          {/* ---------------------------------------------------------------- */}
          <Section id="background" numeral="I" title="Background and Context">
            <P>
              Asthma is a chronic respiratory condition and a leading cause of childhood morbidity in
              the United States, affecting approximately 6.5% of children (Akinbami et al., 2016).
              Prevalence and severity vary by demographic, socioeconomic, and environmental factors,
              with children from racial and ethnic minority backgrounds and lower socioeconomic
              positions bearing a disproportionate burden (Keet et al., 2015; Patti et al., 2024).
              Outdoor air pollutants — including ozone (O₃), fine particulate matter (PM2.5, PM10),
              oxides of nitrogen (NOx), Volatile Organic Compounds (VOCs), and sulfur dioxide (SO₂) —
              are established triggers of asthma exacerbation and have been linked to new-onset
              disease (Brauer et al., 2024; Guarnieri &amp; Balmes, 2014; WHO, 2021).
            </P>
            <P>
              Exposure-response analyses have demonstrated that even modest reductions in ambient
              pollution may significantly lower pediatric exacerbation rates (Huang et al., 2021;
              Khreis et al., 2017). Indoor exposures such as secondhand smoke, gas cooking, mold, and
              inadequate ventilation further compound risk, particularly in low-income households
              (Patti et al., 2024). Despite this convergent evidence, most environmental epidemiology
              studies assess outdoor and indoor exposures independently, failing to capture the total
              exposure burden experienced by a child across multiple microenvironments throughout the
              day. No prior work has operationalized a single, portable, time-weighted composite index
              that combines ambient pollutant surfaces with household-level indoor exposures and
              temporal weighting for pediatric asthma research.
            </P>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section id="description" numeral="II" title="Project Description and Objectives">
            <P>
              This thesis is embedded within the BREATHE-CC (Bridging Respiratory Exposures, Asthma,
              and Environmental Health — Corpus Christi) Study, a prospective pediatric respiratory
              health cohort developed by the Melaram Lab at Texas A&amp;M University-Corpus Christi
              and based at Driscoll Children&rsquo;s Hospital in Corpus Christi, Texas. BREATHE-CC
              follows children with asthma through monthly surveys, electronic health record (EHR)
              abstraction, and geospatial environmental monitoring to understand how household
              conditions, ambient air pollution, and social determinants of health shape respiratory
              outcomes in a predominantly Hispanic coastal community.
            </P>

            <Erratum>
              {PROPOSAL_ERRATA.publication}{' '}
              <Link href="/study" className="font-medium underline underline-offset-2">
                Open the study context
              </Link>
              .
            </Erratum>

            <P>
              As part of our prior BREATHE-CC work, we have already characterized the geospatial
              exposure landscape (PM2.5, O₃, SO₂, and VOCs) of the Texas Coastal Bend region since
              2016, providing the established geocoding and environmental framework upon which this
              thesis builds.
            </P>

            <Figure
              number={1}
              src="/proposal/figure-1-monitoring-sites.jpeg"
              alt="Map of BREATHE-CC air monitoring sites across Corpus Christi, Texas"
              caption="BREATHE-CC Air Monitoring Sites in Corpus Christi, TX."
            />

            <P>The thesis pursues two interlocking aims:</P>

            <Aim n={1} title="Develop and Validate an Integrated Exposure Index (IEI)">
              <P className="text-sm">
                I will create a weighted composite exposure metric integrating outdoor exposures
                (residential proximity to highways and industrial zones; ambient PM2.5, PM10, O₃, SO₂
                from TCEQ/EPA stations) with indoor household exposures from BREATHE-CC surveys
                (secondhand smoke, gas cooking, mold/dampness, ventilation quality, pet allergens).
                For children in multi-household custody or in school/daycare, exposures will be
                time-weighted across exposure locations using existing percentage-of-time variables
                collected in the cohort. The IEI will be validated through sensitivity analyses
                (varying weighting schemes, spatial interpolation methods) and comparison against
                single-pollutant models.
              </P>
            </Aim>

            <Erratum>{PROPOSAL_ERRATA.supplement}</Erratum>

            <Aim n={2} title="Test IEI Associations with Pediatric Asthma Outcomes">
              <P className="text-sm">
                Using available BREATHE-CC data, I will examine the IEI&rsquo;s independent
                associations with (a) monthly asthma exacerbation frequency, (b) Childhood Asthma
                Control Test (C-ACT) scores, and (c) wheezing phenotype trajectories identified via
                Group-Based Trajectory Modeling (Warden et al., 2025). Models will adjust for
                sociodemographic covariates including household income, parental education, insurance
                status, housing tenure, food insecurity, and other established demographic variables.
                The analysis pipeline will be built as a reproducible, documented codebase so it can
                be rerun on the full BREATHE-CC cohort once data collection is finalized.
              </P>
            </Aim>

            <div className="rounded-md border-l-2 border-accent bg-surface/60 p-3">
              <P className="text-sm">
                <strong className="font-sans font-semibold text-brand-800">Note on scope:</strong> An
                earlier version of this proposal included the development of a Neighborhood
                Completeness Index (NCI) and testing the NCI × IEI interaction as an effect modifier
                of asthma outcomes. Following discussion with the thesis sponsor, the scope was
                refined to focus on the IEI in depth rather than pursuing breadth across two indices.
                The NCI remains a viable extension for future work and may be pursued post-thesis or
                as time permits.
              </P>
            </div>

            <SubHeading>Novelty, Significance, and Research Gap</SubHeading>

            <P>
              It is important to distinguish the contributions of this thesis from the existing scope
              of the BREATHE-CC Study. BREATHE-CC is designed as a prospective data-collection
              infrastructure: it recruits pediatric asthma patients, administers baseline and monthly
              surveys, abstracts electronic health record data, and monitors local ambient air
              quality. This study plans to leverage this existing structure by creating unique indices
              from the existing data and test a novel hypothesis through these indices. BREATHE-CC
              does not include the construction of a Neighborhood Completeness Index, does not compute
              an Integrated Exposure Index, and has no current plans to test interaction effects
              between neighborhood-level constructed-environment factors and environmental exposures
              on respiratory outcomes. These analytical constructs and the questions they aim to
              address are entirely original contributions proposed by this thesis.
            </P>

            <P>The significance of this work is twofold:</P>

            <Erratum>{PROPOSAL_ERRATA.threefold}</Erratum>

            <ol className="space-y-3">
              <li>
                <P className="text-sm">
                  <strong className="font-sans font-semibold text-brand-800">(1)</strong> It addresses
                  a well-documented gap in the pediatric environmental health literature. Outdoor air
                  pollutants and childhood asthma have been extensively studied in isolation: a
                  systematic review and meta-analysis of 41 studies demonstrated significant
                  associations between traffic-related air pollutants (PM2.5, NO₂, black carbon) and
                  childhood asthma development (Khreis et al., 2017), and a large multi-cohort
                  analysis found that early-life PM2.5 and NO₂ exposure increased asthma incidence,
                  with heightened risk among minoritized families in under-resourced communities
                  (Zanobetti et al., 2024). Indoor exposures have similarly been linked to respiratory
                  disease independently: meta-analytic evidence shows gas cooking increases childhood
                  asthma risk by 32% (Lin et al., 2013), an estimated 12.7% of U.S. childhood asthma
                  is attributable to gas stove use (Gruenwald et al., 2023), and household mold and
                  dampness exposure in early life elevates asthma risk by 39% (Tischer et al., 2011).
                  While exposomics frameworks have called for integration of indoor and outdoor
                  exposures (Pajewska-Szmyt et al., 2025), and statistical mixture methods have
                  modeled joint pollutant effects on childhood asthma (Alcala et al., 2024; Hu et al.,
                  2024), no prior work has operationalized a single, portable, time-weighted composite
                  index that combines ambient pollutant surfaces with household-level indoor exposures
                  for pediatric asthma research; the IEI will attempt to fill this methodological gap.
                </P>
              </li>
              <li>
                <P className="text-sm">
                  <strong className="font-sans font-semibold text-brand-800">(2)</strong> The
                  methodological tools this thesis will produce — the IEI weighting framework, the
                  reproducible analysis pipeline, and the validation methodology — are designed to be
                  reusable and transferable. Future cohort studies beyond BREATHE-CC can adopt the IEI
                  framework to conduct more comprehensive exposure analyses wherever simultaneous
                  indoor and outdoor exposure data are collected. Beyond research, the IEI has
                  practical applications for informing public health policy and directing
                  environmental justice interventions in underserved communities. Additionally, this
                  thesis provides novel insight into a severely underrepresented population in
                  environmental health research despite bearing disproportionate exposure burden (Jin
                  &amp; Melaram, 2025).
                </P>
              </li>
            </ol>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section id="grounding" numeral="III" title="Disciplinary Grounding">
            <P>
              The following disciplines operate at the core of this study&rsquo;s methodology and
              conceptualization. Figure 2 gives a graphical representation of the interdisciplinary
              framework that this thesis is rooted in.
            </P>
            {DISCIPLINES.map((d) => (
              <RunIn key={d.name} label={`${d.name}:`}>
                {d.body}
              </RunIn>
            ))}
            <Erratum>{PROPOSAL_ERRATA.nci}</Erratum>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section id="justification" numeral="IV" title="Interdisciplinary Justification">
            <P>
              This project cannot be housed within a single department at Rollins College for several
              reasons. First, the research question itself sits at a disciplinary intersection: asking
              how integrated environmental exposure — spanning indoor household conditions and outdoor
              ambient pollution — relates to childhood asthma requires combining epidemiological
              exposure assessment with anthropological understandings of how lived environments shape
              health. Neither discipline alone frames this question in this way.
            </P>
            <P>
              The methods employed are also multi-disciplinary. The IEI requires environmental
              epidemiology for exposure characterization, geospatial science for spatial
              interpolation, data science for pipeline construction, and medical anthropology for
              contextualizing findings within the social determinants of health experienced by a
              predominantly Hispanic, coastal, petrochemical-adjacent community.
            </P>
            <P>
              Furthermore, Rollins College does not have an established public health department in
              the College of Liberal Arts. My thesis advisor, Dr. Shan-Estelle Brown, is housed in
              Anthropology and directs the Global Health minor, but my thesis is not eligible to be
              coded under a minor-only program. BREATHE-CC, the study under which this thesis
              operates, is a multi-institutional collaboration between Texas A&amp;M
              University–Corpus Christi, Driscoll Children&rsquo;s Hospital, and the Global Institute
              for Hispanic Health that is interdisciplinary by design.
            </P>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section id="preparation" numeral="V" title="Academic Preparation and Relevant Experience">
            <P>
              My coursework and research experience have prepared me across each discipline of this
              thesis:
            </P>
            <RunIn label="Quantitative and Statistical Training.">
              I completed PSY 250 and PSY 255 (Psychology Research Methods and Statistical Methods I
              &amp; II), which provided foundational training in study design, hypothesis testing,
              regression, and ANOVAs. DTA 250 (Data Analytics) covered applied data science methods
              including data cleaning, organization, and visualization. In high school, I completed AP
              Statistics, Calculus I, Calculus II, and Differential Equations/Linear Algebra,
              establishing a strong mathematical foundation to understand the spatial modeling,
              composite index construction, and trajectory analysis required by this project.
            </RunIn>
            <RunIn label="Chemistry and Biology:">
              BCH 335 (Biochemistry) provided the mechanistic understanding of how environmental
              pollutants interact with biological systems, covering topics such as oxidative stress
              and signal transduction cascades that apply to immune dysregulation. My overall
              coursework in chemistry and biology has also provided me with an analytical and
              biologically-rooted perspective, ensuring I can interpret exposure-outcome associations
              within a biochemical framework, not merely a statistical one.
            </RunIn>
            <RunIn label="Medical Exposure:">
              Through my Advent Health Observership at Rollins (HPA 397), I developed a greater
              understanding of the American hospital system and directly witnessed pediatric
              respiratory emergencies. While at Rollins, I also earned my Emergency Medical Technician
              Licensure through the Orlando Medical Institute and completed over 100 clinical hours,
              providing me with fundamental medical background to understand the pathophysiology of
              asthma, how patients maintain their disease, and what signs and symptoms indicate
              worsened condition. This experience allows me to translate my statistical findings into
              meaningful medical applications.
            </RunIn>
            <RunIn label="Research Experience — Melaram Lab:">
              I serve as Project Coordinator for the BREATHE-CC Study at Texas A&amp;M
              University–Corpus Christi under Dr. Rajesh Melaram. In this role, I designed and built
              the entire REDCap survey architecture — all instruments, variables, branching logic,
              calculated fields, events, and alert systems — from the ground up. I am intimately
              familiar with every variable in the dataset, having created them. I also coordinate
              between the research team at TAMU-CC, clinical staff at Driscoll Children&rsquo;s
              Hospital, and the Global Institute for Hispanic Health.
            </RunIn>
            <P>
              Beyond BREATHE-CC, I am a co-author on a published time series analysis of ambient ozone
              and fine particulate matter in Corpus Christi (Sanchez-Warren et al., 2025), which
              established the geospatial exposure characterization that BREATHE-CC and this thesis
              extends. I am also running a systematic review of epigenetic changes (DNA methylation)
              resulting from prenatal PM2.5 exposure that has taught me on a molecular level how
              exposure can contribute to disease. I am also first author on an interdisciplinary
              agriculture/environmental science/public health manuscript submitted for publication
              that has provided me with experience in scientific writing from multiple perspectives.
            </P>
            <RunIn label="AI Workflow and Pipeline Design:">
              I also serve as the AI workflow and pipeline designer for the Melaram Lab, where I have
              built multi-phase automated workflows for data processing, survey translation, alert
              generation, and analytical pipelines. This experience directly informs the computational
              pipeline design required for IEI construction and the reproducible analysis codebase.
            </RunIn>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section id="methods" numeral="VI" title="Methods">
            <RunIn label="Geocoding and Geospatial Framework:">
              Participant residential addresses (primary and secondary households, plus school/daycare
              locations) are already geocoded as part of the BREATHE-CC infrastructure. Using
              geospatial APIs (e.g., OpenStreetMap/Overpass, Google Places, EPA AirNow, TCEQ, and
              EJScreen), I will extract ambient pollutant concentrations and proximity metrics for
              each geocoded address.
            </RunIn>
            <RunIn label="Integrated Exposure Index:">
              The IEI will combine outdoor exposures (monthly time-weighted average PM2.5, PM10, O₃,
              SO₂ via Inverse Distance Weighting; proximity to highways and industrial zones) with
              indoor exposures (secondhand smoke, gas cooking, mold/dampness, ventilation quality, pet
              allergens) from BREATHE-CC surveys. For multi-household children, exposures are
              time-weighted using the percentage-of-time-at-primary-home variable. Existing ambient
              air pollutant data will be used to geospatially interpolate the concentrations at
              relevant locations for each of the participants as well.
            </RunIn>
            <RunIn label="Statistical Analysis:">
              Poisson or negative binomial regression for monthly exacerbation counts; linear mixed
              models for repeated C-ACT scores; GBTM for wheezing phenotype identification (Henderson
              et al., 2008; Warden et al., 2025); multinomial logistic regression testing NCI/IEI as
              predictors of trajectory group membership; and multiplicative interaction terms (NCI ×
              IEI) with stratified analyses by NCI tertiles. All models adjust for household income,
              parental education, insurance, housing tenure, and food insecurity. Analyses will be
              conducted in SAS 9.4 and R 4.3+.
            </RunIn>
            <RunIn label="Data Availability:">
              The BREATHE-CC cohort is actively enrolling and data collection is ongoing. Analyses for
              this thesis will use available data at the time of each analysis phase. The analysis
              pipeline is designed as a reproducible, documented codebase so it can be rerun on the
              complete cohort dataset once finalized. Preliminary results based on available data will
              be reported with appropriate caveats regarding sample size and generalizability.
            </RunIn>

            <SubHeading>Proposed Timeline</SubHeading>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-hairline text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="w-40 pb-2 pr-3 font-medium">Phase</th>
                    <th className="pb-2 font-medium">Activities</th>
                  </tr>
                </thead>
                <tbody>
                  {PROPOSED_TIMELINE.map((row) => (
                    <tr key={row.phase} className="border-b border-hairline/50 align-top">
                      <td className="py-2.5 pr-3">
                        <span className="font-medium text-brand-800">{row.phase}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {row.course}
                        </span>
                      </td>
                      <td className="py-2.5 leading-relaxed text-ink">{row.activities}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">
              The 33-week plan the dashboard actually runs on is a later refinement of this table —
              see <Link href="/timeline" className="text-accent underline underline-offset-2">Timeline</Link>.
            </p>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section id="committee" numeral="VII" title="Thesis Sponsor and Committee">
            <div className="space-y-2">
              {COMMITTEE_TABLE.map((m) => (
                <div key={m.name} className="rounded-md border border-hairline/70 bg-white p-3">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-sm font-semibold text-brand-800">{m.name}</span>
                    <Badge variant={m.role === 'Thesis Sponsor' ? 'accent' : 'outline'} size="sm">
                      {m.role}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{m.detail}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section id="framework" numeral="VIII" title="Summary Framework">
            <FrameworkFigure disciplines={DISCIPLINES} />
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section id="evaluation" numeral="IX" title="Thesis Evaluation Criteria">
            {([
              { key: 'fall_2026' as const, label: 'Fall 2026 Evaluation: HON 498 HD' },
              { key: 'spring_2027' as const, label: 'Spring 2027 Evaluation: HON 499 HD' },
            ]).map(({ key, label }) => {
              const semester = evaluationCriteria[key];
              return (
                <div key={key} className="space-y-2">
                  <SubHeading>{label}</SubHeading>
                  <P className="text-sm">{semester.description}</P>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-hairline text-left text-xs uppercase tracking-wide text-muted-foreground">
                          <th className="pb-2 pr-3 font-medium">Component</th>
                          <th className="w-16 pb-2 text-right font-medium">Weight</th>
                          <th className="pb-2 pl-4 font-medium">Description &amp; Criteria</th>
                        </tr>
                      </thead>
                      <tbody>
                        {semester.components.map((c) => (
                          <tr key={c.id} className="border-b border-hairline/50 align-top">
                            <td className="py-2.5 pr-3 font-medium text-brand-800">{c.name}</td>
                            <td className="py-2.5 text-right tabular-nums text-muted-foreground">
                              {c.weight}%
                            </td>
                            <td className="py-2.5 pl-4 leading-relaxed text-ink">{c.description}</td>
                          </tr>
                        ))}
                        <tr className="text-sm font-semibold text-brand-800">
                          <td className="py-2">Total</td>
                          <td className="py-2 text-right tabular-nums">100%</td>
                          <td />
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground">
              Live progress against these components is tracked on the{' '}
              <Link href="/evaluation" className="text-accent underline underline-offset-2">
                Evaluation tracker
              </Link>
              .
            </p>
          </Section>

          {/* ---------------------------------------------------------------- */}
          <Section id="references" title="References">
            <ol className="space-y-3">
              {REFERENCES.map((r) => (
                <li
                  key={r.title}
                  className="border-l-2 border-hairline pl-3 font-serif text-sm leading-relaxed text-ink"
                >
                  {r.authors} ({r.year}). {r.title}. <em>{r.source}</em>.
                  {r.doi ? (
                    <>
                      {' '}
                      <a
                        href={r.doi}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all font-sans text-xs text-accent hover:underline"
                      >
                        {r.doi}
                      </a>
                    </>
                  ) : null}
                </li>
              ))}
            </ol>

            <Card className="mt-4 border-info/40 bg-info-soft/30">
              <CardContent className="flex items-start gap-2.5 p-4">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <p className="text-sm leading-relaxed text-ink">
                  The BREATHE-CC protocol itself has since been published and is not in the list
                  above: {PUBLICATION.citation}{' '}
                  <a
                    href={PUBLICATION.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-accent hover:underline"
                  >
                    View article
                    <ArrowUpRight className="inline h-3 w-3" />
                  </a>
                </p>
              </CardContent>
            </Card>
          </Section>
        </article>
      </div>
    </>
  );
}

function Field({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm leading-snug text-ink">{value}</p>
    </div>
  );
}
