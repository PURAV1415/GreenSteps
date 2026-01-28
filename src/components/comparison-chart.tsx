'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type ComparisonChartProps = {
  personal: number;
};

const data = [
  {
    name: 'Emissions (kg CO₂)',
    'Your Emissions': 0, // This will be updated
    'Department Avg.': 2.1,
    'Campus Avg.': 2.8,
  },
];


export function ComparisonChart({ personal }: ComparisonChartProps) {
    const chartData = [
      {
        ...data[0],
        'Your Emissions': personal
      }
    ];

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical" barSize={30}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" hide />
                <Tooltip cursor={{ fill: 'hsl(var(--accent) / 0.2)' }} />
                <Legend />
                <Bar dataKey="Your Emissions" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Department Avg." fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Campus Avg." fill="hsl(var(--muted-foreground))" radius={[0, 4, 4, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
