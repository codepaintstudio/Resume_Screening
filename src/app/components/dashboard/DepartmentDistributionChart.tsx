import React, { useEffect, useState } from 'react';
import { 
  PieChart, 
  Pie
} from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/app/components/ui/chart';
import { Skeleton } from "@/app/components/ui/skeleton";

const chartConfig = {
  "前端部": {
    label: "前端部",
    color: "#2563eb",
  },
  "UI部": {
    label: "UI部",
    color: "#8b5cf6",
  },
  "办公室": {
    label: "办公室",
    color: "#ec4899",
  },
  "运维": {
    label: "运维",
    color: "#f97316",
  },
} satisfies ChartConfig;

export function DepartmentDistributionChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/distribution')
      .then(res => res.json())
      .then(data => {
        // 确保 data 是数组
        if (Array.isArray(data)) {
          setData(data);
        } else {
          console.warn('API returned non-array data:', data);
          setData([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load distribution data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <h3 className="text-lg font-black tracking-tight mb-4 md:mb-6">简历占比</h3>
        <div className="flex justify-center mb-4 md:mb-6">
          <Skeleton className="w-[160px] h-[160px] md:w-[180px] md:h-[180px] rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // 确保 data 是数组
  const chartData = Array.isArray(data) ? data : [];
  const total = chartData.reduce((acc, curr) => acc + (curr.value || 0), 0);

  return (
    <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
      <h3 className="text-lg font-black tracking-tight mb-4 md:mb-6">简历占比</h3>
      <div className="relative">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[220px] md:max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={88}
              paddingAngle={4}
              cornerRadius={6}
            />
          </PieChart>
        </ChartContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-slate-900 dark:text-white">{total}</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase">Total</span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {chartData.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }}></div>
            <span className="text-slate-500 font-bold flex-1">{item.name}</span>
            <span className="font-black">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
