import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsLoading() {
  return (
    <div className="p-6">
      <Skeleton className="h-10 w-48 mb-6" />
      
      {/* Tabs skeleton */}
      <div className="mb-8">
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile picture card skeleton */}
        <div className="col-span-1">
          <Skeleton className="h-[300px] rounded-xl" />
        </div>
        
        {/* Profile info card skeleton */}
        <div className="col-span-1 lg:col-span-2">
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    </div>
  )
} 