import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium leading-tight',
  {
    variants: {
      variant: {
        default: 'border-brand-200 bg-brand-50 text-brand-800',
        outline: 'border-hairline bg-white text-muted-foreground',
        solid: 'border-transparent bg-brand-800 text-white',
        accent: 'border-transparent bg-accent text-white',
        success: 'border-success/30 bg-success-soft text-success-ink',
        warning: 'border-warning/30 bg-warning-soft text-warning-ink',
        danger: 'border-danger/30 bg-danger-soft text-danger-ink',
        muted: 'border-slate-200 bg-slate-100 text-slate-600',
      },
      size: { sm: 'px-1.5 py-0 text-[11px]', default: '' },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { badgeVariants };
