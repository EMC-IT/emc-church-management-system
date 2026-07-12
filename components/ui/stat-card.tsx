import { Minus, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardTrend = {
  value: string;
  direction?: "up" | "down" | "neutral";
};

type StatCardAccent = "primary" | "secondary" | "success" | "accent";

type StatCardProps = {
  title: string;
  value: ReactNode;
  icon: LucideIcon;
  description?: ReactNode;
  trend?: StatCardTrend;
  accent?: StatCardAccent;
};

const trendIcon: Record<NonNullable<StatCardTrend["direction"]>, LucideIcon> = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

const trendColor: Record<NonNullable<StatCardTrend["direction"]>, string> = {
  up: "text-brand-success",
  down: "text-destructive",
  neutral: "text-muted-foreground",
};

const accentBorder: Record<StatCardAccent, string> = {
  primary: "border-l-brand-primary",
  secondary: "border-l-brand-secondary",
  success: "border-l-brand-success",
  accent: "border-l-brand-accent",
};

export const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  accent,
}: StatCardProps) => {
  const direction = trend?.direction ?? "up";
  const TrendIcon = trendIcon[direction];

  return (
    <Card className={cn(accent && "border-l-4", accent && accentBorder[accent])}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-foreground">{value}</div>
        {trend ? (
          <p className={cn("mt-1 flex items-center gap-1 text-xs font-medium", trendColor[direction])}>
            <TrendIcon className="h-3 w-3" aria-hidden="true" />
            {trend.value}
          </p>
        ) : description ? (
          <div className="mt-1 text-xs text-muted-foreground">{description}</div>
        ) : null}
      </CardContent>
    </Card>
  );
};
