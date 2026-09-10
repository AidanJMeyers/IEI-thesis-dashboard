'use client';

import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { PROPOSAL_SECTIONS } from '@/lib/proposal';
import { cn, withBasePath } from '@/lib/utils';

/** Numbered section heading, and the scroll target for the table of contents. */
export function Section({
  id,
  numeral,
  title,
  children,
}: {
  id: string;
  numeral?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-hairline/60 pt-8 first:border-0 first:pt-0">
      <h2 className="mb-4 flex items-baseline gap-2.5 text-lg font-semibold tracking-tight text-brand-800">
        {numeral ? (
          <span className="text-sm font-normal tabular-nums text-accent">{numeral}.</span>
        ) : null}
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/** Body paragraph. Serif, because this is a document, not an interface. */
export function P({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('font-serif text-[15px] leading-[1.75] text-ink', className)}>{children}</p>
  );
}

export function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="pt-2 text-sm font-semibold uppercase tracking-wide text-accent">{children}</h3>
  );
}

/** A lettered run-in heading, as the proposal uses for each discipline. */
export function RunIn({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <P>
      <strong className="font-sans font-semibold text-brand-800">{label}</strong> {children}
    </P>
  );
}

/**
 * A correction to the proposal as approved. Shown beside the original wording
 * rather than replacing it — the committee is reading from their own copy, and
 * silently diverging from that would be worse than noting the difference.
 */
export function Erratum({ children }: { children: React.ReactNode }) {
  return (
    <aside className="flex gap-2.5 rounded-md border border-warning/40 bg-warning-soft/50 p-3">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning-ink" />
      <p className="text-sm leading-relaxed text-warning-ink">
        <span className="font-semibold">Since approval:</span> {children}
      </p>
    </aside>
  );
}

/** The named Aim blocks in section II. */
export function Aim({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-hairline/70 bg-surface/50 p-4">
      <h3 className="mb-1.5 text-sm font-semibold text-brand-800">
        <span className="mr-2 rounded bg-accent px-1.5 py-0.5 text-xs font-semibold text-white">
          Aim {n}
        </span>
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export function Figure({
  src,
  alt,
  caption,
  number,
}: {
  src: string;
  alt: string;
  caption: string;
  number: number;
}) {
  return (
    <figure className="my-2">
      <div className="overflow-hidden rounded-lg border border-hairline bg-white p-2">
        {/* Plain <img>: the static export runs without the Next image optimizer. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={withBasePath(src)} alt={alt} className="mx-auto block h-auto w-full max-w-2xl" />
      </div>
      <figcaption className="mt-2 text-center text-xs text-muted-foreground">
        <span className="font-medium text-brand-800">Figure {number}.</span> {caption}
      </figcaption>
    </figure>
  );
}

/** Sticky table of contents with scroll-spy. Desktop only. */
export function TableOfContents() {
  const [active, setActive] = React.useState(PROPOSAL_SECTIONS[0].id);

  React.useEffect(() => {
    const headings = PROPOSAL_SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Nearest heading to the top of the viewport wins, so the highlight
        // tracks reading position rather than whichever entry fired last.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="Proposal contents" className="sticky top-24 space-y-0.5">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        Contents
      </p>
      {PROPOSAL_SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className={cn(
            'block rounded px-2.5 py-1.5 text-sm leading-snug transition-colors',
            active === s.id
              ? 'bg-brand-50 font-medium text-brand-800'
              : 'text-slate-600 hover:bg-surface hover:text-brand-800',
          )}
        >
          {s.numeral ? (
            <span className="mr-1.5 text-xs tabular-nums text-slate-400">{s.numeral}</span>
          ) : null}
          {s.title}
        </a>
      ))}
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/*  Figure 2 — interdisciplinary convergence framework                          */
/* -------------------------------------------------------------------------- */

function FlowBox({
  title,
  lines,
  tone = 'default',
  className,
}: {
  title: string;
  lines?: string[];
  tone?: 'default' | 'accent' | 'solid' | 'muted';
  className?: string;
}) {
  const tones = {
    default: 'border-hairline bg-white text-ink',
    accent: 'border-accent/40 bg-brand-50 text-brand-800',
    solid: 'border-brand-800 bg-brand-800 text-white',
    muted: 'border-hairline/70 bg-surface text-muted-foreground',
  };
  return (
    <div className={cn('rounded-lg border p-3 text-center', tones[tone], className)}>
      <p className="text-xs font-semibold leading-tight">{title}</p>
      {lines?.map((l) => (
        <p key={l} className="mt-1 text-[11px] leading-snug opacity-80">
          {l}
        </p>
      ))}
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex justify-center py-1.5" aria-hidden>
      <svg width="14" height="18" viewBox="0 0 14 18" className="text-brand-300">
        <path d="M7 0v12M7 17l-5-6h10z" fill="currentColor" />
      </svg>
    </div>
  );
}

/**
 * Rebuilt from the proposal's Figure 2 rather than screenshotted. The original
 * is a Word table; as markup it stays legible on a phone, scales without
 * blurring, and its text is selectable and searchable.
 */
export function FrameworkFigure({ disciplines }: { disciplines: { short: string; caption: string }[] }) {
  return (
    <figure className="my-2">
      <div className="rounded-lg border border-hairline bg-white p-4 sm:p-5">
        <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Disciplinary foundations
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {disciplines.map((d) => (
            <FlowBox key={d.short} title={d.short} lines={[d.caption]} tone="accent" />
          ))}
        </div>

        <Arrow />

        <div className="grid gap-2 sm:grid-cols-2">
          <FlowBox
            title="Study Population"
            lines={['Predominantly Hispanic TX Coastal Bend', 'pediatric asthma cohort (n ≈ 200)']}
          />
          <FlowBox
            title="BREATHE-CC Data Infrastructure"
            lines={['Monthly REDCap surveys', 'EHR abstraction', 'Air quality monitoring']}
          />
        </div>

        <Arrow />

        <FlowBox
          title="Integrated Exposure Index (IEI)"
          lines={['outdoor pollutants + indoor exposures, time-weighted']}
          tone="solid"
        />

        <Arrow />

        <FlowBox
          title="Pediatric Asthma Outcomes"
          lines={[
            'exacerbation frequency | C-ACT scores | wheezing phenotype trajectories (GBTM)',
            'adjusted for income, education, insurance, housing tenure, food insecurity',
          ]}
        />

        <Arrow />

        <div className="grid gap-2 sm:grid-cols-3">
          <FlowBox
            title="Manuscript 1"
            lines={['IEI Methods Manuscript', 'Honors Thesis | Spring 2027']}
            tone="muted"
          />
          <FlowBox
            title="Analysis Pipeline"
            lines={['Documented, reproducible code', 'Built during thesis period']}
            tone="muted"
          />
          <FlowBox
            title="Manuscript 2"
            lines={['Full exposure–outcome analysis', 'Post-thesis | ~2028']}
            tone="muted"
          />
        </div>
      </div>
      <figcaption className="mt-2 text-center text-xs text-muted-foreground">
        <span className="font-medium text-brand-800">Figure 2.</span> Interdisciplinary convergence
        framework for the proposed honors thesis.
      </figcaption>
    </figure>
  );
}
