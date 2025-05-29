"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"

export function NewPrescriptionForm() {
  const [open, setOpen] = useState(false)
  const [colorTheme, setColorTheme] = useState("purple")
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    patient: "",
    medication: "",
    dosage: "",
    quantity: "",
    instructions: "",
    prescriber: "",
  })

  // Ensure we only access localStorage on the client side
  useEffect(() => {
    setMounted(true)
    const savedColorTheme = localStorage.getItem("pawtrack-color-theme") || "purple"
    setColorTheme(savedColorTheme)
  }, [])

  // Don't render until after component has mounted on the client
  if (!mounted) return <Button className="theme-button text-white">
    <Plus className="mr-2 h-4 w-4" /> New Prescription
  </Button>

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    setOpen(false)
    // Reset form
    setFormData({
      patient: "",
      medication: "",
      dosage: "",
      quantity: "",
      instructions: "",
      prescriber: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="theme-button text-white">
          <Plus className="mr-2 h-4 w-4" /> New Prescription
        </Button>
      </DialogTrigger>
      <DialogContent className={`sm:max-w-[600px] theme-${colorTheme}`}>
        <DialogHeader>
          <DialogTitle className="text-xl theme-text-primary">Create New Prescription</DialogTitle>
          <DialogDescription>Fill out the form below to create a new prescription</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patient" className="text-gray-500 dark:text-gray-400">
                Patient
              </Label>
              <Select value={formData.patient} onValueChange={(value) => handleChange("patient", value)} required>
                <SelectTrigger id="patient" className="w-full">
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="max">Max (Golden Retriever)</SelectItem>
                  <SelectItem value="bella">Bella (Siamese Cat)</SelectItem>
                  <SelectItem value="charlie">Charlie (Labrador)</SelectItem>
                  <SelectItem value="daisy">Daisy (Rabbit)</SelectItem>
                  <SelectItem value="oscar">Oscar (Maine Coon)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="prescriber" className="text-gray-500 dark:text-gray-400">
                Prescriber
              </Label>
              <Select value={formData.prescriber} onValueChange={(value) => handleChange("prescriber", value)} required>
                <SelectTrigger id="prescriber" className="w-full">
                  <SelectValue placeholder="Select prescriber" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dr-johnson">Dr. Johnson</SelectItem>
                  <SelectItem value="dr-martinez">Dr. Martinez</SelectItem>
                  <SelectItem value="dr-wilson">Dr. Wilson</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="medication" className="text-gray-500 dark:text-gray-400">
              Medication
            </Label>
            <Select value={formData.medication} onValueChange={(value) => handleChange("medication", value)} required>
              <SelectTrigger id="medication" className="w-full">
                <SelectValue placeholder="Select medication" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amoxicillin">Amoxicillin 250mg</SelectItem>
                <SelectItem value="doxycycline">Doxycycline 100mg</SelectItem>
                <SelectItem value="prednisone">Prednisone 5mg</SelectItem>
                <SelectItem value="enrofloxacin">Enrofloxacin 15mg</SelectItem>
                <SelectItem value="famotidine">Famotidine 10mg</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dosage" className="text-gray-500 dark:text-gray-400">
                Dosage
              </Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => handleChange("dosage", e.target.value)}
                placeholder="e.g., 1 tablet twice daily"
                required
              />
            </div>
            <div>
              <Label htmlFor="quantity" className="text-gray-500 dark:text-gray-400">
                Quantity
              </Label>
              <Input
                id="quantity"
                value={formData.quantity}
                onChange={(e) => handleChange("quantity", e.target.value)}
                placeholder="e.g., 20 tablets"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="instructions" className="text-gray-500 dark:text-gray-400">
              Instructions
            </Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => handleChange("instructions", e.target.value)}
              placeholder="Enter detailed instructions..."
              className="resize-none"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="theme-button text-white">
              Create Prescription
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 