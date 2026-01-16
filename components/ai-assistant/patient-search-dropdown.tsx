"use client"

import { useState, useEffect, useRef } from "react"
import { Search, User, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePatientSearch, Patient } from "@/components/appointments/hooks/use-patient-search"
import { useSelectedPatient } from "./contexts/selectedDoctor"

const searchOptions = [
  { value: "name", label: "Patient Name" },
  { value: "client_first_name", label: "Client Name" },
  { value: "client_email", label: "Client Email" },
  { value: "client_phone_primary", label: "Client Phone" },
]

export function PatientSearchDropdown() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState("name")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { selectedPatient, setSelectedPatient } = useSelectedPatient()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { results, isLoading, error } = usePatientSearch(searchQuery, searchType)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setIsDropdownOpen(true)
  }

  const handleSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    setSearchQuery("")
    setIsDropdownOpen(false)
  }

  const handleClearSelection = () => {
    setSelectedPatient(null)
    setSearchQuery("")
  }

  // Helper function to get secondary information for display
  const getSecondaryInfo = (patient: Patient): string => {
    if (patient.email && searchType === "client_email") {
      return `Email: ${patient.email}`
    }
    if (patient.phone && searchType === "client_phone_primary") {
      return `Phone: ${patient.phone}`
    }
    if (patient.email) return `Email: ${patient.email}`
    if (patient.phone) return `Phone: ${patient.phone}`
    return ""
  }

  return (
    <Card className="border border-[#1E3D3D]/40 dark:border-[#1E3D3D]/60 shadow-sm 
  bg-gradient-to-r from-white to-[#D2EFEC]/30 
  dark:from-slate-900 dark:to-[#1E3D3D]/20">
      <CardContent className="p-2">
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <div className="relative flex-1 w-full sm:w-auto" ref={dropdownRef}>
            <div className="flex flex-col sm:flex-row gap-1.5">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={handleInputChange}
                  className="pl-7 h-8 text-xs"
                />
              </div>
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger className="w-full sm:w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Search by" />
                </SelectTrigger>
                <SelectContent>
                  {searchOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-xs">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isDropdownOpen && searchQuery && (
              <div className="absolute z-50 mt-1 w-full rounded-md bg-card border shadow-lg">
                {isLoading ? (
                  <div className="p-2 text-xs text-muted-foreground flex items-center justify-center">
                    <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                    Loading...
                  </div>
                ) : error ? (
                  <div className="p-2 text-xs text-destructive bg-destructive/10 rounded-md m-1">
                    Error: {error}
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-2 text-xs text-muted-foreground text-center">
                    No results found
                  </div>
                ) : (
                  <ul className="max-h-[200px] overflow-auto py-1">
                    {results.map((patient) => (
                      <li
                        key={patient.id}
                        className="cursor-pointer px-2 py-1.5 hover:bg-accent transition-colors text-xs"
                        onClick={() => handleSelect(patient)}
                      >
                        <div className="font-medium">{patient.name}</div>
                        {patient.clientName && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Owner: {patient.clientName}
                          </div>
                        )}
                        {getSecondaryInfo(patient) && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {getSecondaryInfo(patient)}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

