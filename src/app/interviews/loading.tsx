import { Skeleton } from "@/app/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="h-[calc(100vh-180px)] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-64 rounded-xl bg-slate-100 dark:bg-slate-800" />
        <Skeleton className="h-10 w-40 rounded-xl bg-slate-100 dark:bg-slate-800" />
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="flex gap-6 h-full">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-80 flex flex-col bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-24 bg-slate-200 dark:bg-slate-800" />
                <Skeleton className="h-6 w-8 bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-32 w-full rounded-xl bg-white dark:bg-slate-800" />
                <Skeleton className="h-32 w-full rounded-xl bg-white dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
