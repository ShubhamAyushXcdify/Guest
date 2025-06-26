"use client"

import type React from "react"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { NewPatientForm } from "@/components/patients/new-patient-form"

interface NewPatientModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NewPatientModal({ isOpen, onClose }: NewPatientModalProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
       <SheetContent className="w-[90%] sm:max-w-[800px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">Add New Patient</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <NewPatientForm onSuccess={onClose} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
