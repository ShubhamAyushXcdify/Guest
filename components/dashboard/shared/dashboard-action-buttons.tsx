"use client"

import { Button } from "@/components/ui/button"
import { useRootContext } from "@/context/RootContext"

interface DashboardActionButtonsProps {
  onNewPatient: () => void
  onNewAppointment: () => void
  onNewInvoice: () => void
  // New props for veterinarian/provider functionality
  onAddProduct?: () => void
  onAddSupplier?: () => void
  onAddClient?: () => void
  onCreatePurchaseOrder?: () => void
}

export const DashboardActionButtons = ({
  onNewPatient,
  onNewAppointment,
  onNewInvoice,
  onAddProduct,
  onAddSupplier,
  onAddClient,
  onCreatePurchaseOrder
}: DashboardActionButtonsProps) => {
  const { userType } = useRootContext()
  
  // Check if user is veterinarian/provider
  const isProvider = userType?.isProvider

  return (
    <div className="flex justify-end gap-3 mb-6 flex-wrap">
      <Button className="theme-button text-white" onClick={onNewPatient}>
        New Patient
      </Button>
      <Button className="theme-button text-white" onClick={onNewAppointment}>
        New Appointment
      </Button>
      {/* <Button className="theme-button text-white" onClick={onNewInvoice}>
        New Invoice
      </Button> */}
      
      {/* Veterinarian/Provider specific buttons */}
      {isProvider && (
        <>
          {onAddProduct && (
            <Button className="theme-button text-white" onClick={onAddProduct}>
              Add Product
            </Button>
          )}
          {onAddSupplier && (
            <Button className="theme-button text-white" onClick={onAddSupplier}>
              Add Supplier
            </Button>
          )}
          {onAddClient && (
            <Button className="theme-button text-white" onClick={onAddClient}>
              Add Client
            </Button>
          )}
          {onCreatePurchaseOrder && (
            <Button className="theme-button text-white" onClick={onCreatePurchaseOrder}>
              Create Purchase Order
            </Button>
          )}
        </>
      )}
    </div>
  )
} 