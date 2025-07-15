'use client'
import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Plus, Trash2 } from "lucide-react";
import withAuth from "@/utils/privateRouter";
import { useDeleteUser } from "@/queries/users/delete-user";
import { toast } from "@/components/ui/use-toast";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import NewDoctor from "./newDoctor";
import DoctorDetails from "./doctorDetails";
import { useGetUsers } from "@/queries/users/get-users";
import { useGetRole } from "@/queries/roles/get-role";

// Match the User type from the main user component
export type Doctor = {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: string;
  roleName: string;
  isActive: boolean;
  licenseNumber?: string;
  lastLogin?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type DoctorProps = {
  clinicId?: string;
};

function DoctorComponent({ clinicId }: DoctorProps) {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [veterinarianRoleId, setVeterinarianRoleId] = useState<string | null>(null);
  
  // Get roles to find veterinarian role ID
  const { data: rolesData } = useGetRole();
  
  // Find and set the veterinarian role ID when roles are loaded
  useEffect(() => {
    if (rolesData?.data) {
      const vetRole = rolesData.data.find(
        (role: { name: string, value: string }) => role.name.toLowerCase() === 'veterinarian' || role.value.toLowerCase() === 'veterinarian'
      );
      if (vetRole) {
        setVeterinarianRoleId(vetRole.id);
      }
    }
  }, [rolesData]);
  
  // Use the roleId parameter when fetching users
  const { data: usersData, isLoading, isError } = useGetUsers(
    pageNumber, 
    pageSize, 
    search, 
    clinicId || '',
    // Only enable the query when we have the veterinarian role ID
    !!veterinarianRoleId,
    veterinarianRoleId || ''
  );
  
  const doctors = usersData?.items || [];
  const totalPages = usersData?.totalPages || 1;
  
  const [openNew, setOpenNew] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const deleteUser = useDeleteUser();

  const handleDoctorClick = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setOpenDetails(true);
  };

  const handleDeleteDoctor = async () => {
    if (!doctorToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteUser.mutateAsync({ id: doctorToDelete.id });
      toast({
        title: "Success",
        description: "Doctor deleted successfully",
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete doctor",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDoctorToDelete(null);
    }
  };

  const openDeleteDialog = (doctor: Doctor) => {
    setDoctorToDelete(doctor);
    setIsDeleteDialogOpen(true);
  };
  
  const handlePageChange = (page: number) => {
    setPageNumber(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(Number(newPageSize));
    setPageNumber(1); // Reset to first page when changing page size
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPageNumber(1); // Reset to first page when searching
  };

  const columns: ColumnDef<Doctor>[] = [
    { accessorKey: "firstName", header: "First Name" },
    { accessorKey: "lastName", header: "Last Name" },
    { accessorKey: "email", header: "Email" },
    { 
      accessorKey: "roleName", 
      header: "Role",
      cell: ({ row }) => row.original.roleName || row.original.role || "Doctor"
    },
    { 
      accessorKey: "isActive", 
      header: "Status", 
      cell: ({ getValue }) => <Badge variant={getValue() ? "default" : "destructive"}>{getValue() ? "Active" : "Inactive"}</Badge>
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
              handleDoctorClick(row.original.id);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-red-500 hover:text-red-700 hover:bg-red-100"
            onClick={(e) => {
              e.stopPropagation();
              openDeleteDialog(row.original);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      meta: { className: "text-center" },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Doctors</h1>
        <Sheet open={openNew} onOpenChange={setOpenNew}>
          <SheetTrigger asChild>
            <Button onClick={() => setOpenNew(true)}>
              <Plus className="mr-2 h-4 w-4" />Add Doctor
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-full md:!max-w-[50%] lg:!max-w-[22%] overflow-hidden">
            <SheetHeader>
              <SheetTitle>New Doctor</SheetTitle>
            </SheetHeader>
            <NewDoctor 
              clinicId={clinicId} 
              onSuccess={() => setOpenNew(false)} 
            />
          </SheetContent>
        </Sheet>
      </div>
      
      {isLoading || !veterinarianRoleId ? (
        <div className="flex items-center justify-center h-32">
          <p>Loading doctors...</p>
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center h-32">
          <p className="text-red-500">Error loading doctors</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={doctors as unknown as Doctor[]}
          searchColumn="email"
          searchPlaceholder="Search doctors..."
          page={pageNumber}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSearch={handleSearch}
        />
      )}

      <Sheet open={openDetails} onOpenChange={setOpenDetails}>
        <SheetContent side="right" className="w-full sm:w-full md:!max-w-[50%] lg:!max-w-[22%] overflow-hidden">
          <SheetHeader>
            <SheetTitle>Doctor Details</SheetTitle>
          </SheetHeader>
          {selectedDoctorId && (
            <DoctorDetails 
              doctorId={selectedDoctorId}
              clinicId={clinicId}
              onSuccess={() => setOpenDetails(false)}
            />
          )}
        </SheetContent>
      </Sheet>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteDoctor}
        title="Delete Doctor"
        itemName={`${doctorToDelete?.firstName || ''} ${doctorToDelete?.lastName || ''}`.trim()}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default withAuth(DoctorComponent);
