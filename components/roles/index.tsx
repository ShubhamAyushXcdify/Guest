'use client'
import React, { useState } from "react";
import { DataTable } from "../ui/data-table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Plus, Trash2, ArrowLeft } from "lucide-react";
import { useGetRole } from "@/queries/roles/get-role";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import NewRole from "./newRole";
import RoleDetails from "./roleDetails";
import { useDeleteRole } from "@/queries/roles/delete-role";
import { toast } from "../ui/use-toast";
import { DeleteConfirmationDialog } from "../ui/delete-confirmation-dialog";
import { Role } from "@/queries/roles/get-role";
import { useRouter } from "next/navigation";

export default function Roles() {
  const router = useRouter();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  
  const { data: rolesData, isLoading, isError } = useGetRole(pageNumber, pageSize, search);
  const roles = rolesData?.data || [];
  const totalPages = rolesData?.totalPages || 1;
  
  const [openNew, setOpenNew] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const deleteRole = useDeleteRole();
  
  // State for delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRoleClick = (roleId: string) => {
    setSelectedRoleId(roleId);
    setOpenDetails(true);
  };

  const openDeleteDialog = (role: Role) => {
    setRoleToDelete(role);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteRole.mutateAsync({ id: roleToDelete.id });
      toast({
        title: "Success",
        description: "Role deleted successfully",
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete role",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setRoleToDelete(null);
    }
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

  const columns: ColumnDef<Role>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "value", header: "Value" },
    { 
      accessorKey: "colourName", 
      header: "Color", 
      cell: ({ getValue }) => (
        <div 
          className="w-6 h-6 rounded-full border border-gray-300" 
          style={{ backgroundColor: getValue() as string }}
        ></div>
      )
    },
    { 
      accessorKey: "isPrivileged", 
      header: "Privileged", 
      cell: ({ getValue }) => <Badge variant={getValue() ? "default" : "secondary"}>{getValue() ? "Yes" : "No"}</Badge>
    },
    { 
      accessorKey: "isClinicRequired", 
      header: "Clinic Required", 
      cell: ({ getValue }) => <Badge variant={getValue() ? "default" : "secondary"}>{getValue() ? "Yes" : "No"}</Badge>
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
              handleRoleClick(row.original.id);
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
      <div>
        <Button variant="outline" size="sm" onClick={() => router.push('/users')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
      </div>
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Roles</h1>
        <Sheet open={openNew} onOpenChange={setOpenNew}>
          <SheetTrigger asChild>
            <Button onClick={() => setOpenNew(true)}>
              <Plus className="mr-2 h-4 w-4" />Add Role
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-full md:!max-w-[50%] lg:!max-w-[22%] overflow-hidden">
            <SheetHeader>
              <SheetTitle>New Role</SheetTitle>
            </SheetHeader>
            <NewRole onSuccess={() => {
              setOpenNew(false);
            }} />
          </SheetContent>
        </Sheet>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <p>Loading roles...</p>
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center h-32">
          <p className="text-red-500">Error loading roles</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={roles}
          searchColumn="name"
          searchPlaceholder="Search roles..."
          page={pageNumber}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSearch={handleSearch}
        />
      )}
      
      {/* Role Details Sheet */}
      <Sheet open={openDetails} onOpenChange={setOpenDetails}>
        <SheetContent side="right" className="w-full sm:w-full md:!max-w-[50%] lg:!max-w-[22%] overflow-hidden">
          <SheetHeader>
            <SheetTitle>Role Details</SheetTitle>
          </SheetHeader>
          {selectedRoleId && (
            <RoleDetails 
              roleId={selectedRoleId}
              onSuccess={() => {
                setOpenDetails(false);
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteRole}
        title="Delete Role"
        itemName={roleToDelete?.name}
        isDeleting={isDeleting}
      />
    </div>
  );
}
