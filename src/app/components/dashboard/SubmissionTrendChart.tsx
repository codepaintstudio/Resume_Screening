import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid
} from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/app/components/ui/chart';

const dailyData = [
  { name: '01-26', value: 12 },
  { name: '01-27', value: 18 },
  { name: '01-28', value: 24 },
  { name: '01-29', value: 15 },
  { name: '01-30', value: 32 },
  { name: '01-31', value: 28 },
  { name: '02-01', value: 45 },
];

const chartConfig = {
  value: {
    label: "数量",
  },
} satisfies ChartConfig;

export function SubmissionTrendChart() {
  return (
    <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-black tracking-tight">最近投递</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Daily Resume Submissions</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
            <span className="text-[10px] font-bold text-slate-400">本周趋势</span>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <ChartContainer config={chartConfig} className="max-h-[300px] w-full">
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} 
              />
              <ChartTooltip 
                cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                content={<ChartTooltipContent />}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={40} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}
