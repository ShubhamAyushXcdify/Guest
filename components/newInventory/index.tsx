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
import { useGetClinic } from "@/queries/clinic/get-clinic"
import { useRootContext } from "@/context/RootContext"
import LocationsTab from "./location-tab"

export default function Inventory() {
  const [mounted, setMounted] = useState(false)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedClinicId, setSelectedClinicId] = useState<string>("")

  const { userType, clinic } = useRootContext();
  const companyId = clinic?.companyId ?? null;
  console.log("Company ID from clinic context:", companyId);
  const { data, isLoading, error } = useGetClinic(
    1,
    10,
    companyId
);
  const clinicsData = data?.items || null;
  
  // If user is clinicAdmin, filter suppliers by clinic ID
  const clinicId = (userType.isClinicAdmin || userType.isVeterinarian) ? clinic.id || '' : '';

  // Ensure we only access localStorage on the client side
  useEffect(() => {
    setMounted(true)
  }, [])

  // Set clinic ID from user context if available, otherwise from clinics data
  useEffect(() => {
    if (clinicId) {
      // Use clinic ID from user context
      setSelectedClinicId(clinicId)
    } else if (clinicsData && clinicsData.length > 0 && !selectedClinicId) {
      // Fallback to first clinic from API if no user clinic
      setSelectedClinicId(clinicsData[0].id)
    }
  }, [clinicsData, selectedClinicId])

  // If not mounted yet, don't render to avoid hydration mismatch
  if (!mounted) return null


  return (
    <>
      <div className="p-6">
        {!clinicId && (
          <div className="flex flex-col md:flex-row justify-between items-center md:items-center mb-6">
            <div className="flex items-center gap-2">
              <Select value={selectedClinicId} onValueChange={setSelectedClinicId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a clinic" />
                </SelectTrigger>
                <SelectContent>
                  {clinicsData?.map((clinic) => (
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
          <TabsList className="grid w-full grid-cols-5 mb-6">
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
              value="locations"
              className="data-[state=active]:theme-text-primary data-[state=active]:border-b-2 data-[state=active]:border-[var(--theme-primary)]"
            >
              Locations
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

          {/* Locations Tab */}
          <TabsContent value="locations">
            <LocationsTab clinicId={selectedClinicId} />
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
