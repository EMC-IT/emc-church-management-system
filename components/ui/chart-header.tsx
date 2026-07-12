import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ChartHeaderTone = "neutral" | "primary" | "secondary" | "success" | "accent";

const toneClasses: Record<ChartHeaderTone, string> = {
  neutral: "bg-muted text-muted-foreground",
  primary: "bg-brand-primary/10 text-brand-primary",
  secondary: "bg-brand-secondary/10 text-brand-secondary",
  success: "bg-brand-success/10 text-brand-success",
  accent: "bg-brand-accent/10 text-brand-accent",
};

type ChartHeaderProps = {
  title: ReactNode;
  badge?: ReactNode;
  tone?: ChartHeaderTone;
  className?: string;
};

export function ChartHeader({ title, badge, tone = "neutral", className }: ChartHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <CardTitle>{title}</CardTitle>
      {badge ? (
        <Badge
          variant="neutral"
          className={cn("shrink-0 border-transparent font-medium", toneClasses[tone])}
        >
          {badge}
        </Badge>
      ) : null}
    </div>
  );
}
