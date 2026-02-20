import { Skeleton } from '@/components/ui/skeleton';

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-white/5 bg-[#121212] p-6">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-4 w-32 bg-white/10" />
        <Skeleton className="h-4 w-4 rounded bg-white/10" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-3 w-full bg-white/10" />
        <Skeleton className="h-3 w-3/4 bg-white/10" />
        <Skeleton className="h-3 w-5/6 bg-white/10" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex space-x-4">
        <Skeleton className="h-4 w-24 bg-white/10" />
        <Skeleton className="h-4 w-32 bg-white/10" />
        <Skeleton className="h-4 w-20 bg-white/10" />
        <Skeleton className="h-4 flex-1 bg-white/10" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <Skeleton className="h-3 w-24 bg-white/10" />
          <Skeleton className="h-3 w-32 bg-white/10" />
          <Skeleton className="h-3 w-20 bg-white/10" />
          <Skeleton className="h-3 flex-1 bg-white/10" />
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 bg-white/10" />
        <Skeleton className="h-10 w-full bg-white/10" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 bg-white/10" />
        <Skeleton className="h-10 w-full bg-white/10" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28 bg-white/10" />
        <Skeleton className="h-10 w-full bg-white/10" />
      </div>
      <Skeleton className="h-10 w-32 bg-white/10" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-40 bg-white/10" />
        <Skeleton className="h-4 w-4 rounded bg-white/10" />
      </div>
      <Skeleton className="h-64 w-full bg-white/10" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 bg-white/10" />
        <Skeleton className="h-4 w-64 bg-white/10" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
