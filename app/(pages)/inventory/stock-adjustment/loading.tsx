import { AppLayout } from "@/components/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function StockAdjustmentLoading() {
  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-64" />
        </div>

        <Card className="bg-white dark:bg-slate-800 shadow-sm mb-6">
          <CardContent className="p-6">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-full max-w-md mb-6" />

            {/* Step 1 */}
            <Skeleton className="h-6 w-36 mb-4" />
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-24" />
            </div>

            {/* Step 2 */}
            <Skeleton className="h-6 w-36 mb-4" />
            <div className="flex gap-4 mb-8">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>

            {/* Step 3 */}
            <Skeleton className="h-6 w-36 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="md:col-span-2">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-24 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex gap-4 mb-4 md:mb-0">
                <Skeleton className="h-10 w-36" />
                <Skeleton className="h-10 w-24" />
              </div>
              <Skeleton className="h-20 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
