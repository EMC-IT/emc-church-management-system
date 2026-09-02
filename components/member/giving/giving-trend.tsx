'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { MemberGivingTrendPoint } from '@/lib/types/member';
import { formatCurrency, cn } from '@/lib/utils';

export interface GivingTrendProps {
  trend: MemberGivingTrendPoint[];
  className?: string;
}

const trendChartConfig = {
  amount: {
    label: 'Total Giving',
    color: 'hsl(var(--primary))',
  },
  tithe: {
    label: 'Tithe',
    color: 'hsl(var(--primary))',
  },
  offering: {
    label: 'Offering',
    color: 'hsl(var(--muted-foreground))',
  },
} satisfies ChartConfig;

export function GivingTrend({ trend, className }: GivingTrendProps) {
  const totalInTrend = trend.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground font-heading">
            Giving Trend
          </CardTitle>
          <span className="text-xs text-muted-foreground">Monthly overview</span>
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex-1 flex flex-col justify-between">
        <ChartContainer config={trendChartConfig} className="h-[220px] w-full">
          <BarChart
            data={trend}
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              className="stroke-border/50"
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs text-muted-foreground"
            />
            <YAxis
              width={65}
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              tickFormatter={(v) => `GH₵${v.toLocaleString()}`}
              className="text-xs text-muted-foreground"
            />
            <ChartTooltip
              cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
              content={
                <ChartTooltipContent
                  formatter={(value, name, item) => (
                    <div className="flex flex-col gap-0.5 text-xs">
                      <span className="font-semibold">{item.payload.month}</span>
                      <span>
                        Total: <strong className="text-foreground">{formatCurrency(item.payload.amount, 'GHS')}</strong>
                      </span>
                      <div className="text-[11px] text-muted-foreground pt-0.5 border-t border-border/30 mt-0.5">
                        Tithe: {formatCurrency(item.payload.tithe, 'GHS')} • Offering & Other: {formatCurrency(item.payload.amount - item.payload.tithe, 'GHS')}
                      </div>
                    </div>
                  )}
                />
              }
            />
            <Bar
              dataKey="amount"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              maxBarSize={44}
            />
          </BarChart>
        </ChartContainer>

        <div className="pt-3 mt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
          <span>5-Month Total</span>
          <span className="font-medium text-foreground">{formatCurrency(totalInTrend, 'GHS')}</span>
        </div>
      </CardContent>
    </Card>
  );
}
