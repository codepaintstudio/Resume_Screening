import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid
} from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/app/components/ui/chart';
import { Skeleton } from "@/app/components/ui/skeleton";

const chartConfig = {
  value: {
    label: "数量",
  },
} satisfies ChartConfig;

export function SubmissionTrendChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetch('/api/dashboard/trend')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load trend data:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  if (loading) {
    return (
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm h-[360px] md:h-[400px]">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-[260px] md:h-[300px] w-full rounded-xl" />
      </div>
    );
  }

  // Dynamic interval calculation to show roughly 7-8 ticks max
  const tickInterval = data.length > 8 ? Math.ceil(data.length / 8) - 1 : 0;
  const barSize = isMobile ? 24 : 40;

  return (
    <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-6 md:mb-8">
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
          <ChartContainer config={chartConfig} className="aspect-[4/3] md:aspect-video max-h-[280px] md:max-h-[340px] w-full">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} 
                dy={10}
                interval={tickInterval}
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
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={barSize} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}
