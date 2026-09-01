'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { MemberAttendanceTrendPoint } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface AttendanceTrendProps {
  trend: MemberAttendanceTrendPoint[];
  className?: string;
}

const trendChartConfig = {
  attended: {
    label: 'Services Attended',
    color: 'hsl(var(--primary))',
  },
  rate: {
    label: 'Attendance Rate (%)',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function AttendanceTrend({ trend, className }: AttendanceTrendProps) {
  return (
    <Card className={cn('h-full flex flex-col', className)}>
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground font-heading">
            Attendance Consistency
          </CardTitle>
          <span className="text-xs text-muted-foreground">Monthly percentage</span>
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex-1 flex flex-col justify-between">
        <ChartContainer config={trendChartConfig} className="h-[220px] w-full">
          <BarChart
            data={trend}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
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
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
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
                        Rate: <strong className="text-foreground">{item.payload.rate}%</strong>
                      </span>
                      <span className="text-muted-foreground">
                        {item.payload.attended} of {item.payload.total} eligible services
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Bar
              dataKey="rate"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              maxBarSize={44}
            />
          </BarChart>
        </ChartContainer>

        <div className="pt-3 mt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
          <span>Target baseline: 80%</span>
          <span className="font-medium text-foreground">5-Month Average: 84%</span>
        </div>
      </CardContent>
    </Card>
  );
}
