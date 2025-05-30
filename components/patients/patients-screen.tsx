"use client"

import { useState } from "react"
import { PatientsTable } from "@/components/patients/patients-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet"
import { NewPatientForm } from "@/components/patients/new-patient-form"
import { useGetPatients } from "@/queries/patients/get-patients"
import { useDebounce } from "@/hooks/use-debounce"

export const PatientsScreen = () => {
  const [openNew, setOpenNew] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  
  const { data: patientsData, isLoading, isError } = useGetPatients(
    page,
    pageSize,
    debouncedSearchQuery
  )
  
  // Extract patients from the paginated response
  const patients = patientsData?.items || []
  const totalPages = patientsData?.totalPages || 1

  const handleSearch = (searchTerm: string) => {
    setSearchQuery(searchTerm)
    setPage(1) // Reset to first page on new search
    
    // Update URL with search parameter but don't expose specific fields
    const url = new URL(window.location.href);
    url.searchParams.set('search', searchTerm);
    
    // Update the URL without page reload
    window.history.pushState({}, '', url.toString());
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(1) // Reset to first page when changing page size
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">Patients</h1>
        <Sheet open={openNew} onOpenChange={setOpenNew}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Patient
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-full md:!max-w-[50%] lg:!max-w-[62%] overflow-auto">
            <SheetHeader>
              <SheetTitle>New Patient</SheetTitle>
            </SheetHeader>
            <NewPatientForm onSuccess={() => setOpenNew(false)} />
          </SheetContent>
        </Sheet>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading patients...</p>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-destructive">Error loading patients. Please try again.</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">No patients found. Add a patient to get started.</p>
          </div>
        ) : (
          <PatientsTable
            patients={patients}
            totalPages={totalPages}
            currentPage={page}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onSearch={handleSearch}
          />
        )}
      </div>
    </div>
  )
} 