import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Empty states here always say what to do next, never just "no data". A blank
 * panel in front of a committee should still teach them something.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-hairline bg-surface/60 px-6 py-10 text-center',
        className,
      )}
    >
      {Icon ? (
        <div className="mb-3 rounded-full bg-white p-2.5 text-accent shadow-card">
          <Icon className="h-5 w-5" />
        </div>
      ) : null}
      <p className="text-sm font-medium text-brand-800">{title}</p>
      {description ? (
        <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function LoadingState({ label = 'Loading dashboard…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-lg border border-hairline/70 bg-white px-6 py-12 text-sm text-muted-foreground">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-200 border-t-accent" />
      {label}
    </div>
  );
}

export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-md bg-surface" />
      ))}
    </div>
  );
}
