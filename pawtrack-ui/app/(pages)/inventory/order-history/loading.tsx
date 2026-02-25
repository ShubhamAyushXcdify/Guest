
import { Skeleton } from "@/components/ui/skeleton"

export default function OrderHistoryLoading() {
  return (
    <>
      <div className="p-6">
        <Skeleton className="h-8 w-64 mb-6" />

        {/* Search and Filters Skeleton */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-full md:w-48" />
          <Skeleton className="h-10 w-full md:w-48" />
          <Skeleton className="h-10 w-full md:w-48" />
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Status Tabs Skeleton */}
        <Skeleton className="h-10 w-full max-w-2xl mb-6" />

        {/* Orders Table Skeleton */}
        <div className="bg-white dark:bg-slate-800 rounded-md shadow-sm mb-6 overflow-hidden">
          <div className="p-4 space-y-4">
            <Skeleton className="h-8 w-full" />
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
          </div>
        </div>

        {/* Summary Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Skeleton className="h-24 w-full rounded-md" />
          <Skeleton className="h-24 w-full rounded-md" />
          <Skeleton className="h-24 w-full rounded-md" />
        </div>

        {/* Pagination Skeleton */}
        <div className="flex justify-end">
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </>
  )
}
