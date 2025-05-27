
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function Loading() {
  return (
    <>
      <div className="p-6">
        <div className="flex items-center mb-2">
          <Skeleton className="h-9 w-32" />
        </div>

        <Skeleton className="h-6 w-64 mb-6" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <Skeleton className="h-8 w-48 mb-4 md:mb-0" />
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </div>

        {/* Report Tabs */}
        <Skeleton className="h-10 w-full mb-6" />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="flex items-center">
                <Skeleton className="w-24 h-24 rounded-full mr-4" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Table */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
          <Skeleton className="h-12 w-full" />
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
