'use client'
import React, { useMemo, useState, useEffect } from "react";
import { DataTable } from "../ui/data-table";
import { Button } from "../ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "../ui/sheet";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { useForm } from "react-hook-form";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useGetClinic } from "@/queries/clinic/get-clinic";
import withAuth from "@/utils/privateRouter";
import NewClinic from "./newClinic";
import ClinicDetails from "./clinicDetails";
import { useDeleteClinic } from "@/queries/clinic/delete-clinic";
import { toast } from "../ui/use-toast";
import { DeleteConfirmationDialog } from "../ui/delete-confirmation-dialog";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { useRootContext } from "@/context/RootContext";

// Clinic type based on provided schema
export type Clinic = {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  taxId: string;
  licenseNumber: string;
  // subscriptionStatus: string;
  // subscriptionExpiresAt: string;
  createdAt: string;
  updatedAt: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  distance: number;
};

type ClinicFormValues = Omit<Clinic, "id" | "createdAt" | "updatedAt">;

function Clinic() {
  const router = useRouter();
  const { userType, clinic: userClinic } = useRootContext();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  
  // Use the useDebouncedValue hook to debounce the search string
  const debouncedSearch = useDebouncedValue(search, 300);
  
  const { data: clinicData, isLoading, isError } = useGetClinic(pageNumber, pageSize, debouncedSearch, null, null, true);
  
  // Extract the clinics from the paginated response
  const clinics = clinicData?.items || [];
  const totalPages = clinicData?.totalPages || 1;
  
  const [openNew, setOpenNew] = useState(false);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clinicToDelete, setClinicToDelete] = useState<Clinic | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteClinic = useDeleteClinic();
  const queryClient = useQueryClient();

  // Redirect clinicAdmin users to the details page with rooms tab
  useEffect(() => {
    if (userType.isClinicAdmin && userClinic.id) {
      router.push(`/clinic/${userClinic.id}/rooms`);
    }
  }, [userType.isClinicAdmin, userClinic.id, router]);

  const handleEditClinicClick = (clinicId: string) => {
    setSelectedClinicId(clinicId);
    setOpenDetails(true);
  };

  const handleDeleteClinic = async () => {
    if (!clinicToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteClinic.mutateAsync({ id: clinicToDelete.id });
    } catch (error) {
      // Handle error
    } finally {
      setIsDeleting(false);
      setClinicToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const openDeleteDialog = (clinic: Clinic) => {
    setClinicToDelete(clinic);
    setIsDeleteDialogOpen(true);
  };

  const handleRowClick = (clinic: Clinic) => {
    router.push(`/clinic/${clinic.id}/rooms`);
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
    
    // Update URL with search parameter
    const url = new URL(window.location.href);
    url.searchParams.set('search', encodeURIComponent(value));
    
    // Update the URL without page reload
    window.history.pushState({}, '', url.toString());
  };

  const columns: ColumnDef<Clinic>[] = [
    { 
      accessorKey: "name", 
      header: "Name",
      cell: ({ row }) => (
        <div 
          className="cursor-pointer text-blue-600 hover:text-blue-800 hover:underline"
          onClick={() => handleRowClick(row.original)}
        >
          {row.original.name}
        </div>
      )
    },
    { accessorKey: "city", header: "City" },
    { accessorKey: "state", header: "State" },
    { accessorKey: "country", header: "Country" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "email", header: "Email" },
    // { accessorKey: "subscriptionStatus", header: "Subscription", cell: ({ getValue }) => <Badge>{getValue() as string}</Badge> },
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
              router.push(`/clinic/${row.original.id}/rooms`);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          {/* Delete button commented out
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
          */}
        </div>
      ),
      meta: { className: "text-center" },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clinics</h1>
        <Sheet open={openNew} onOpenChange={setOpenNew}>
          <SheetTrigger asChild>
            <Button className={`theme-button text-white`} onClick={() => setOpenNew(true)}><Plus className="mr-2 h-4 w-4" />Add Clinic</Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-full md:!max-w-[50%] lg:!max-w-[50%] overflow-hidden overflow-y-auto">
            <SheetHeader>
              <SheetTitle>New Clinic</SheetTitle>
            </SheetHeader>
            <NewClinic onSuccess={() => { setOpenNew(false); }} />
          </SheetContent>
        </Sheet>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <p>Loading clinics...</p>
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center h-32">
          <p className="text-red-500">Error loading clinics</p>
        </div>
      ) : clinics.length === 0 ? (
        <div className="flex items-center justify-center h-32">
          <p>No clinics found. Click "Add Clinic" to create one.</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={clinics as Clinic[]}
          searchColumn="name"
          searchPlaceholder="Search clinics..."
          page={pageNumber}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSearch={handleSearch}
        />
      )}

      <Sheet open={openDetails} onOpenChange={setOpenDetails}>
      <SheetContent side="right" className="w-full sm:w-full md:!max-w-[50%] lg:!max-w-[50%] overflow-hidden overflow-y-auto">
      <SheetHeader>
            <SheetTitle>Clinic Details</SheetTitle>
          </SheetHeader>
          {selectedClinicId && (
            <ClinicDetails 
              clinicId={selectedClinicId}
              onSuccess={() => setOpenDetails(false)}
            />
          )}
        </SheetContent>
      </Sheet>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteClinic}
        title="Delete Clinic"
        itemName={clinicToDelete?.name}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default withAuth(Clinic);