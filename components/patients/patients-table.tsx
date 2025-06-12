"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Eye, Trash2, Calendar } from "lucide-react"
import { Patient } from "@/queries/patients/get-patients"
import { useDeletePatient } from "@/queries/patients/delete-patients"
import { toast } from "@/components/ui/use-toast"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { formatDate } from "@/lib/utils"
import NewAppointment from "@/components/appointments/newAppointment"

interface PatientsTableProps {
  patients: Patient[]
  totalPages: number
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onSearch: (term: string) => void
}

export function PatientsTable({
  patients,
  totalPages,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onSearch,
}: PatientsTableProps) {
  const router = useRouter()
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [showNewAppointment, setShowNewAppointment] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  
  const deletePatientMutation = useDeletePatient()

  const handleDeleteClick = (patient: Patient) => {
    setPatientToDelete(patient)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!patientToDelete) return

    try {
      await deletePatientMutation.mutateAsync(patientToDelete.id)
      toast({
        title: "Patient deleted",
        description: `${patientToDelete.name} has been deleted successfully.`,
      })
      setIsDeleteDialogOpen(false)
      setPatientToDelete(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the patient. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleViewPatient = (patientId: string) => {
    router.push(`/patients/${patientId}`)
  }

  const handleEditPatient = (patientId: string) => {
    router.push(`/patients/${patientId}/edit`)
  }

  const handleBookAppointment = (patientId: string) => {
    setSelectedPatientId(patientId)
    setShowNewAppointment(true)
  }

  const columns: ColumnDef<Patient>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "species", header: "Species" },
    { accessorKey: "breed", header: "Breed" },
    { 
      accessorKey: "gender", 
      header: "Gender",
      cell: ({ row }) => (
        <div>
          {row.original.gender}
          {row.original.isNeutered && " (Neutered)"}
        </div>
      )
    },
    { 
      accessorKey: "dateOfBirth", 
      header: "Date of Birth",
      cell: ({ getValue }) => formatDate(getValue() as string)
    },
    { 
      accessorKey: "isActive", 
      header: "Status", 
      cell: ({ getValue }) => (
        <Badge variant={getValue() ? "default" : "destructive"}>
          {getValue() ? "Active" : "Inactive"}
        </Badge>
      )
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <div className="flex gap-2 justify-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              handleViewPatient(row.original.id);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleBookAppointment(row.original.id);
            }}
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-red-500 hover:text-red-700 hover:bg-red-100"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row.original);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      meta: { className: "text-center" },
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={patients || []}
        searchColumn="name"
        searchPlaceholder="Search patients..."
        onSearch={onSearch}
        page={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onEditButtonClick={(rowId) => handleEditPatient(rowId)}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Patient"
        description={`Are you sure you want to delete ${patientToDelete?.name}? This action cannot be undone.`}
        onConfirm={confirmDelete}
        isDeleting={deletePatientMutation.isPending}
      />

      <NewAppointment 
        isOpen={showNewAppointment} 
        onClose={() => {
          setShowNewAppointment(false)
          setSelectedPatientId(null)
        }}
        patientId={selectedPatientId || undefined}
      />
    </>
  )
} 