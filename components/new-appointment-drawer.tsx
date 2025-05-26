"use client"

import type React from "react"

import { useState } from "react"
import { Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface NewAppointmentDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function NewAppointmentDrawer({ isOpen, onClose }: NewAppointmentDrawerProps) {
  const [formData, setFormData] = useState({
    patient: "",
    date: "",
    time: "",
    provider: "",
    reason: "",
    notes: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Appointment data:", formData)
    // Here you would typically send the data to your backend
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md p-0 overflow-y-auto">
        <div className="flex flex-col h-full">
          <SheetHeader
            className="text-white p-6 flex flex-row justify-between items-center"
            style={{ backgroundColor: "var(--theme-primary)" }}
          >
            <SheetTitle className="text-2xl font-bold text-white">Schedule New Appointment</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient</Label>
              <Select onValueChange={(value) => handleSelectChange("patient", value)}>
                <SelectTrigger id="patient" className="w-full">
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bella">Bella (Cat)</SelectItem>
                  <SelectItem value="max">Max (Dog)</SelectItem>
                  <SelectItem value="charlie">Charlie (Dog)</SelectItem>
                  <SelectItem value="daisy">Daisy (Rabbit)</SelectItem>
                  <SelectItem value="oscar">Oscar (Cat)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <div className="relative">
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full pr-10"
                    required
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <div className="relative">
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full pr-10"
                    required
                  />
                  <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Select onValueChange={(value) => handleSelectChange("provider", value)}>
                <SelectTrigger id="provider" className="w-full">
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dr-smith">Dr. Smith</SelectItem>
                  <SelectItem value="dr-johnson">Dr. Johnson</SelectItem>
                  <SelectItem value="dr-williams">Dr. Williams</SelectItem>
                  <SelectItem value="dr-brown">Dr. Brown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Visit</Label>
              <Select onValueChange={(value) => handleSelectChange("reason", value)}>
                <SelectTrigger id="reason" className="w-full">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="check-up">Check-up</SelectItem>
                  <SelectItem value="vaccination">Vaccination</SelectItem>
                  <SelectItem value="illness">Illness</SelectItem>
                  <SelectItem value="injury">Injury</SelectItem>
                  <SelectItem value="dental">Dental</SelectItem>
                  <SelectItem value="surgery">Surgery</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={4} />
            </div>
          </form>

          <div className="p-6 border-t mt-auto">
            <div className="flex justify-between space-x-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="theme-button text-white flex-1">
                Schedule
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
