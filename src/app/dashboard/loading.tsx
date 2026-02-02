import { Skeleton } from "@/app/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-7">
        <Skeleton className="col-span-4 h-[400px] rounded-2xl bg-slate-100 dark:bg-slate-800" />
        <Skeleton className="col-span-3 h-[400px] rounded-2xl bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  );
}
