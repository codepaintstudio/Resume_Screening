import { Skeleton } from "@/app/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="h-[calc(100vh-180px)] flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-3">
          <Skeleton className="h-10 w-64 rounded-xl bg-slate-100 dark:bg-slate-800" />
          <Skeleton className="h-10 w-32 rounded-xl bg-slate-100 dark:bg-slate-800" />
          <Skeleton className="h-10 w-32 rounded-xl bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32 rounded-xl bg-slate-100 dark:bg-slate-800" />
          <Skeleton className="h-10 w-32 rounded-xl bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-1">
        <div className="space-y-4 p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl bg-slate-50 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    </div>
  );
}
