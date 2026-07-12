import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex w-fit max-w-full items-center justify-center gap-1 rounded-full border font-medium leading-none whitespace-nowrap',
  {
    variants: {
      variant: {
        neutral: 'border-[hsl(var(--badge-neutral-border))] bg-[hsl(var(--badge-neutral-bg))] text-[hsl(var(--badge-neutral-text))]',
        primary: 'border-[hsl(var(--badge-primary-border))] bg-[hsl(var(--badge-primary-bg))] text-[hsl(var(--badge-primary-text))]',
        success: 'border-[hsl(var(--badge-success-border))] bg-[hsl(var(--badge-success-bg))] text-[hsl(var(--badge-success-text))]',
        warning: 'border-[hsl(var(--badge-warning-border))] bg-[hsl(var(--badge-warning-bg))] text-[hsl(var(--badge-warning-text))]',
        danger: 'border-[hsl(var(--badge-danger-border))] bg-[hsl(var(--badge-danger-bg))] text-[hsl(var(--badge-danger-text))]',
        info: 'border-[hsl(var(--badge-info-border))] bg-[hsl(var(--badge-info-bg))] text-[hsl(var(--badge-info-text))]',
      },
      size: {
        sm: 'min-h-5 px-2 py-0.5 text-xs',
        md: 'min-h-6 px-2.5 py-1 text-xs',
        lg: 'min-h-8 px-3.5 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'md',
    },
  }
);

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;
export type BadgeSize = NonNullable<VariantProps<typeof badgeVariants>['size']>;

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
