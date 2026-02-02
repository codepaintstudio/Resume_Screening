import { Skeleton } from "@/app/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Nav Skeleton */}
      <aside className="w-full lg:w-64 space-y-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-2xl bg-slate-100 dark:bg-slate-800" />
        ))}
      </aside>

      {/* Content Area Skeleton */}
      <div className="flex-1 max-w-3xl space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm h-[600px] p-8">
          <div className="flex items-center gap-6 mb-8">
            <Skeleton className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800" />
            <div className="space-y-3">
              <Skeleton className="h-6 w-32 bg-slate-100 dark:bg-slate-800" />
              <Skeleton className="h-4 w-48 bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Skeleton className="h-12 w-full rounded-xl bg-slate-50 dark:bg-slate-800" />
            <Skeleton className="h-12 w-full rounded-xl bg-slate-50 dark:bg-slate-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
