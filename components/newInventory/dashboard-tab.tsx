"use client"

import { Package, AlertTriangle, Clock, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useGetInventoryDashboard } from "@/queries/inventory/get-dashboard";

interface DashboardTabProps {
  clinicId: string
}

export default function DashboardTab({ clinicId }: DashboardTabProps) {
  const { data, isLoading, isError } = useGetInventoryDashboard(clinicId);

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }
  if (isError || !data) {
    return <div>Error loading dashboard data.</div>;
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Items"
          value={data.totalItems}
          trend=""
          trendColor="text-green-500"
          icon={<Package className="h-8 w-8 text-blue-500" />}
        />
        <StatsCard
          title="Low Stock Items"
          value={data.lowStockItemsCount}
          trend=""
          trendColor="text-red-500"
          icon={<AlertTriangle className="h-8 w-8 text-red-500" />}
        />
        <StatsCard
          title="Expiring Soon"
          value={data.expiringSoonItems}
          trend=""
          trendColor="text-amber-500"
          icon={<Clock className="h-8 w-8 text-amber-500" />}
        />
        <StatsCard
          title="Pending Orders"
          value={data.pendingPurchaseOrders}
          trend=""
          trendColor="text-blue-500"
          icon={<ShoppingCart className="h-8 w-8 text-blue-500" />}
        />
      </div>

      {/* Low Stock Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
        <Card className="bg-white dark:bg-slate-800 shadow-sm">
          <CardContent className="p-0">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Low Stock Alert</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Current
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Threshold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {data.lowStockItems && data.lowStockItems.length > 0 ? (
                    data.lowStockItems.map((item) => (
                      <LowStockItem
                        key={item.productId}
                        name={item.productName}
                        current={item.currentItemUnits}
                        threshold={item.threshold}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        No low stock items.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Categories */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Inventory Categories</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <CategoryCard
            title="Medications"
            count={data.numberOfAntibiotics + data.numberOfPainManagement}
            bgColor="bg-blue-50 dark:bg-blue-900/20"
            textColor="text-blue-500"
          />
          <CategoryCard
            title="Vaccines"
            count={data.numberOfVaccines}
            bgColor="bg-green-50 dark:bg-green-900/20"
            textColor="text-green-500"
          />
          <CategoryCard
            title="Medical Supplies"
            count={data.numberOfMedicalSupplies}
            bgColor="bg-red-50 dark:bg-red-900/20"
            textColor="text-red-500"
          />
          <CategoryCard
            title="Food & Supplements"
            count={data.numberOfFood + data.numberOfSupplements}
            bgColor="bg-purple-50 dark:bg-purple-900/20"
            textColor="text-purple-500"
          />
        </div>
      </div>
    </>
  )
}

function StatsCard({ title, value, trend, trendColor, icon } : any) {
  return (
    <Card className="bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
      <div className="h-1 theme-accent"></div>
      <CardContent className="p-6">
        <div className="flex justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold mt-1 theme-text-primary">{value}</p>
            <p className={`text-sm mt-1 ${trendColor}`}>{trend}</p>
          </div>
          <div className="flex items-start">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function LowStockItem({ name, current, threshold } : any) {
  const severity =
    current <= threshold * 0.25 ? "text-red-600" : current <= threshold * 0.5 ? "text-amber-600" : "text-blue-600"

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{name}</td>
      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${severity}`}>{current}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{threshold}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <Button variant="secondary" size="sm" className="theme-button-secondary">
          Order
        </Button>
      </td>
    </tr>
  )
}

function CategoryCard({ title, count, bgColor, textColor } : any) {
  return (
    <Card className={`shadow-sm ${bgColor} border-0 overflow-hidden`}>
      <div className="h-1 theme-accent"></div>
      <CardContent className="p-6 text-center">
        <h4 className={`text-lg font-medium ${textColor}`}>{title}</h4>
        <p className={`text-3xl font-bold mt-2 theme-text-primary`}>{count}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">items</p>
      </CardContent>
    </Card>
  )
} 