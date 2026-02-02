import { Skeleton } from "@/app/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Tabs Skeleton */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-900 w-fit rounded-xl border border-slate-200 dark:border-slate-800">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-lg bg-white dark:bg-slate-800" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area (Wide, Left) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm h-[600px]">
            <div className="space-y-4 mb-8">
              <Skeleton className="h-8 w-1/3 bg-slate-50 dark:bg-slate-800" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-12 w-full rounded-xl bg-slate-50 dark:bg-slate-800" />
              <Skeleton className="h-12 w-full rounded-xl bg-slate-50 dark:bg-slate-800" />
              <Skeleton className="h-64 w-full rounded-xl bg-slate-50 dark:bg-slate-800" />
            </div>
          </div>
        </div>

        {/* Sidebar Panel (Narrow, Right) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm h-fit">
            <Skeleton className="h-6 w-1/2 mb-4 bg-slate-50 dark:bg-slate-800" />
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-xl bg-slate-50 dark:bg-slate-800" />
              <Skeleton className="h-12 w-full rounded-xl bg-slate-50 dark:bg-slate-800" />
            </div>
          </div>
          
          <div className="bg-blue-600/5 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/20">
             <Skeleton className="h-6 w-1/3 mb-4 bg-blue-100 dark:bg-blue-900/40" />
             <Skeleton className="h-20 w-full rounded-xl bg-blue-50 dark:bg-blue-900/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
