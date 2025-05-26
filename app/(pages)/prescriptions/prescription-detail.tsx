"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { StatusBadge } from "./status-badge"

export function PrescriptionDetail({ prescription, open, onOpenChange, colorTheme = "purple" }) {
  const [status, setStatus] = useState(prescription.status)
  const [notes, setNotes] = useState("")

  const handleStatusChange = (value) => {
    setStatus(value)
  }

  const handleSave = () => {
    // Here you would save the changes to the prescription
    console.log("Saving changes:", { status, notes })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-[600px] theme-${colorTheme}`}>
        <DialogHeader>
          <DialogTitle className="text-xl theme-text-primary">Prescription {prescription.id}</DialogTitle>
          <DialogDescription>View and update prescription details</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patient" className="text-gray-500 dark:text-gray-400">
                Patient
              </Label>
              <div id="patient" className="font-medium">
                {prescription.patient}
              </div>
            </div>
            <div>
              <Label htmlFor="date" className="text-gray-500 dark:text-gray-400">
                Date
              </Label>
              <div id="date" className="font-medium">
                {prescription.date}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="medication" className="text-gray-500 dark:text-gray-400">
                Medication
              </Label>
              <div id="medication" className="font-medium">
                {prescription.medication}
              </div>
            </div>
            <div>
              <Label htmlFor="prescriber" className="text-gray-500 dark:text-gray-400">
                Prescribed By
              </Label>
              <div id="prescriber" className="font-medium">
                {prescription.prescribedBy}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dosage" className="text-gray-500 dark:text-gray-400">
                Dosage
              </Label>
              <div id="dosage" className="font-medium">
                1 tablet twice daily for 10 days
              </div>
            </div>
            <div>
              <Label htmlFor="quantity" className="text-gray-500 dark:text-gray-400">
                Quantity
              </Label>
              <div id="quantity" className="font-medium">
                20 tablets
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="instructions" className="text-gray-500 dark:text-gray-400">
              Instructions
            </Label>
            <div id="instructions" className="font-medium">
              Give with food. Complete the entire course of medication even if symptoms improve.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status" className="text-gray-500 dark:text-gray-400">
                Status
              </Label>
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Dispensed">Dispensed</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <StatusBadge status={status} />
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-gray-500 dark:text-gray-400">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this prescription..."
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="theme-button text-white" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
