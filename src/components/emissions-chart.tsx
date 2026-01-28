'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import type { DailyData } from '@/lib/types';

const chartConfig = {
  emissions: {
    label: 'CO₂ Emissions (kg)',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

type EmissionsChartProps = {
  data: DailyData[];
};

export function EmissionsChart({ data }: EmissionsChartProps) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
       <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <YAxis />
          <Tooltip
            cursor={{ fill: 'hsl(var(--accent) / 0.2)' }}
            content={<ChartTooltipContent />}
          />
          <Bar dataKey="emissions" fill="hsl(var(--primary))" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
