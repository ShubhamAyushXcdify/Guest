"use client"

import { useState, useEffect } from "react"
import { useRootContext } from "@/context/RootContext"
import { useGetClinic } from "@/queries/clinic/get-clinic"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { setClinicId, setClinicName } from "@/utils/clientCookie"
import { useQueryClient } from "@tanstack/react-query"
import { parseAsString, useQueryStates } from "nuqs"

export function ClinicSelector() {
  const { user, userType, clinic } = useRootContext()
  const queryClient = useQueryClient()
  const [qp, setQp] = useQueryStates({ clinicId: parseAsString })
  
  // Only fetch clinics for veterinarian users
  const { data: clinicsData } = useGetClinic(
    1,
    100,
    user?.companyId || null,
    Boolean(userType?.isVeterinarian && user?.companyId),
    userType?.isVeterinarian ? user?.id : null // Pass userId for veterinarian
  )
  const clinics = clinicsData?.items || []
  
  // Sync URL clinicId -> context when available; otherwise reflect context into URL
  useEffect(() => {
    if (!userType?.isVeterinarian) return
    if (clinics.length === 0) return
    // If URL has clinicId and differs from context, update context from URL
    if (qp.clinicId && qp.clinicId !== clinic?.id) {
      const selected = clinics.find(c => String(c.id) === String(qp.clinicId))
      if (selected) {
        clinic?.setClinic?.({ id: String(selected.id), name: selected.name, companyId: selected.companyId })
      }
      return
    }
    // If URL missing but context has id, reflect context into URL
    if (!qp.clinicId && clinic?.id) {
      setQp({ clinicId: clinic.id })
      return
    }
    // If neither present, default to first clinic
    if (!qp.clinicId && !clinic?.id && clinics[0]?.id) {
      setQp({ clinicId: String(clinics[0].id) })
      clinic?.setClinic?.({ id: String(clinics[0].id), name: clinics[0].name, companyId: clinics[0].companyId })
    }
  }, [qp.clinicId, clinic?.id, clinics, userType?.isVeterinarian, setQp])

  useEffect(() => {
    if (typeof window !== 'undefined' && clinic?.id) {
      queryClient.invalidateQueries({ queryKey: ['appointment'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-infinite'] });
      queryClient.invalidateQueries({ queryKey: ['inventorySearch'] });
      queryClient.invalidateQueries({ queryKey: ['allInventorySearch'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order'] });
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      queryClient.invalidateQueries({ queryKey: ['purchaseOrder'] });
      queryClient.invalidateQueries({ queryKey: ['purchaseOrderItems'] });
      queryClient.invalidateQueries({ queryKey: ['receivedPurchaseOrders'] });
      queryClient.invalidateQueries({ queryKey: ['purchaseOrderReceivingHistory'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['clinic'] });
      queryClient.refetchQueries({ queryKey: ['inventory-dashboard'] });
      queryClient.refetchQueries({ queryKey: ['inventory'] });
    }
  }, [clinic?.id]);
  
  const handleClinicChange = (clinicId: string) => {
  if (clinic?.id === clinicId) return // Compare with context clinic.id now

  const selectedClinic = clinics.find(c => String(c.id) === String(clinicId))
  if (!selectedClinic) return

  // Update URL state
  setQp({ clinicId })
  clinic?.setClinic?.({
    id: clinicId,
    name: selectedClinic.name,
    companyId: selectedClinic.companyId
  })
  }
  
  // Only show for veterinarian users
  if (!userType?.isVeterinarian || clinics.length === 0 || clinics.length === 1) {
    return null
  }
  
  const effectiveClinicId = qp.clinicId || clinic?.id || ""

  return (
    <div className="px-2 text-black">
      <div className="bg-white/10 rounded-lg p-3">
        <label className="flex items-center gap-2 text-sm font-[500] uppercase text-black/70 mb-2">Select Clinic</label>
        <Select
          value={effectiveClinicId}
          onValueChange={handleClinicChange}
        >
          <SelectTrigger className=" border border-[#1E3D3D] text-black">
            <SelectValue placeholder="Select a clinic" />
          </SelectTrigger>
          <SelectContent>
            {clinics.map((clinic) => (
              <SelectItem key={String(clinic.id)} value={String(clinic.id)}>
                {clinic.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}