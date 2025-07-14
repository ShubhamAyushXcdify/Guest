"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { OrderModal } from "./order-modal"
import DashboardTab from "./dashboard-tab"
import PurchaseOrdersTab from "./purchase-orders-tab"
import ReceivingTab from "./receiving-tab"
import StockTab from "./stock-tab"
import { useGetClinics } from "@/queries/clinics/get-clinics"
import { useRootContext } from "@/context/RootContext"

export default function Inventory() {
  const [mounted, setMounted] = useState(false)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedClinicId, setSelectedClinicId] = useState<string>("")

  const { data: clinicsData } = useGetClinics()
  const { user, userType, clinic } = useRootContext()

  // Ensure we only access localStorage on the client side
  useEffect(() => {
    setMounted(true)
  }, [])

  // Set clinic ID from user context if available, otherwise from clinics data
  useEffect(() => {
    if (user?.clinic?.id) {
      // Use clinic ID from user context
      setSelectedClinicId(user.clinic.id)
    } else if (clinicsData?.items && clinicsData.items.length > 0 && !selectedClinicId) {
      // Fallback to first clinic from API if no user clinic
      setSelectedClinicId(clinicsData.items[0].id)
    }
  }, [user, clinicsData, selectedClinicId])

  // If not mounted yet, don't render to avoid hydration mismatch
  if (!mounted) return null

  // Check if we should show the clinic selector (only when user doesn't have a clinic)
  const shouldShowClinicSelector = !user?.clinic?.id

  return (
    <>
      <div className="p-6">
        {!clinic.id && (
          <div className="flex flex-col md:flex-row justify-between items-center md:items-center mb-6">
            <div className="flex items-center gap-2">
              <Select value={selectedClinicId} onValueChange={setSelectedClinicId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a clinic" />
                </SelectTrigger>
                <SelectContent>
                  {clinicsData?.items?.map((clinic) => (
                    <SelectItem key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>)}
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:theme-text-primary data-[state=active]:border-b-2 data-[state=active]:border-[var(--theme-primary)]"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="purchase-orders"
              className="data-[state=active]:theme-text-primary data-[state=active]:border-b-2 data-[state=active]:border-[var(--theme-primary)]"
            >
              Purchase Orders
            </TabsTrigger>
            <TabsTrigger
              value="receiving"
              className="data-[state=active]:theme-text-primary data-[state=active]:border-b-2 data-[state=active]:border-[var(--theme-primary)]"
            >
              Purchase Order Receiving
            </TabsTrigger>
            <TabsTrigger
              value="stock"
              className="data-[state=active]:theme-text-primary data-[state=active]:border-b-2 data-[state=active]:border-[var(--theme-primary)]"
            >
              Stock
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <DashboardTab clinicId={selectedClinicId} />
          </TabsContent>

          {/* Purchase Orders Tab */}
          <TabsContent value="purchase-orders">
            <PurchaseOrdersTab
              clinicId={selectedClinicId}
              onNewOrder={() => setIsOrderModalOpen(true)}
            />
          </TabsContent>

          {/* Purchase Order Receiving Tab */}
          <TabsContent value="receiving">
            <ReceivingTab clinicId={selectedClinicId} />
          </TabsContent>

          {/* Stock Tab */}
          <TabsContent value="stock">
            <StockTab clinicId={selectedClinicId} />
          </TabsContent>
        </Tabs>
      </div>

      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        clinicId={selectedClinicId}
      />
    </>
  )
}
