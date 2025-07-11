'use client'
import React, { useState } from "react";
import { DataTable } from "../ui/data-table";
import { Button } from "../ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { Badge } from "../ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useGetSupplier } from "@/queries/suppliers/get-supplier";
import withAuth from "@/utils/privateRouter";
import NewSupplier from "./newSupplier";
import { useDeleteSupplier } from "@/queries/suppliers/delete-supplier";
import { toast } from "../ui/use-toast";
import { DeleteConfirmationDialog } from "../ui/delete-confirmation-dialog";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import SupplierDetails from "./supplierDetails";
import { useRootContext } from "@/context/RootContext";

// Supplier type based on provided schema
export type Supplier = {
  id: string;
  clinicId: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  accountNumber: string;
  paymentTerms: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type SupplierFormValues = Omit<Supplier, "id" | "createdAt" | "updatedAt">;

function Supplier() {
  const router = useRouter();
  const { userType, clinic } = useRootContext();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  
  // If user is clinicAdmin, filter suppliers by clinic ID
  const clinicId = userType.isClinicAdmin ? clinic.id || '' : '';
  
  const { data: supplierData, isLoading, isError } = useGetSupplier(pageNumber, pageSize, search, clinicId);
  
  // Extract suppliers from the paginated response
  const suppliers = supplierData?.items || [];
  const totalPages = supplierData?.totalPages || 1;
  
  const [openNew, setOpenNew] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteSupplier = useDeleteSupplier();
  const queryClient = useQueryClient();

  const handleEditSupplierClick = (supplierId: string) => {
    setSelectedSupplierId(supplierId);
    setOpenDetails(true);
  };

  const handleDeleteSupplier = async () => {
    if (!supplierToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteSupplier.mutateAsync({ id: supplierToDelete.id });
      toast({
        title: "Success",
        description: "Supplier deleted successfully",
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete supplier",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setSupplierToDelete(null);
    }
  };

  const openDeleteDialog = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setIsDeleteDialogOpen(true);
  };

  const handleRowClick = (supplier: Supplier) => {
    router.push(`/supplier/${supplier.id}`);
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

  const columns: ColumnDef<Supplier>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "contactPerson", header: "Contact Person" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "city", header: "City" },
    { accessorKey: "state", header: "State" },
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
              handleEditSupplierClick(row.original.id);
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
        <h1 className="text-2xl font-bold">Suppliers</h1>
        <Sheet open={openNew} onOpenChange={setOpenNew}>
          <SheetTrigger asChild>
            <Button className={`theme-button text-white`} onClick={() => setOpenNew(true)}><Plus className="mr-2 h-4 w-4" />Add Supplier</Button>
          </SheetTrigger>
          <SheetContent side="right" className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>New Supplier</SheetTitle>
            </SheetHeader>
            <NewSupplier onSuccess={() => { setOpenNew(false); }} />
          </SheetContent>
        </Sheet>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <p>Loading suppliers...</p>
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center h-32">
          <p className="text-red-500">Error loading suppliers</p>
        </div>
      ) : suppliers.length === 0 ? (
        <div className="flex items-center justify-center h-32">
          <p>No suppliers found. Click "Add Supplier" to create one.</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={suppliers as unknown as Supplier[]}
          searchColumn="name"
          searchPlaceholder="Search suppliers..."
          page={pageNumber}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSearch={handleSearch}
        />
      )}

      <Sheet open={openDetails} onOpenChange={setOpenDetails}>
        <SheetContent side="right" className="w-full sm:w-full md:!max-w-[50%] lg:!max-w-[37%] overflow-hidden">
          <SheetHeader>
            <SheetTitle>Supplier Details</SheetTitle>
          </SheetHeader>
          {selectedSupplierId && (
            <SupplierDetails 
              supplierId={selectedSupplierId}
              onSuccess={() => setOpenDetails(false)}
            />
          )}
        </SheetContent>
      </Sheet>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteSupplier}
        title="Delete Supplier"
        itemName={supplierToDelete?.name}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default withAuth(Supplier); 