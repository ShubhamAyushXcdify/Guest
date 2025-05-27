'use client'
import React, { useState } from "react";
import { DataTable } from "../ui/data-table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useGetUsers } from "@/queries/users/get-users";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import NewUser from "./newUser";
import UserDetails from "./userDetails";
import { useDeleteUser } from "@/queries/users/delete-user";
import { toast } from "../ui/use-toast";
import { DeleteConfirmationDialog } from "../ui/delete-confirmation-dialog";

// User type based on the provided API schema
export type User = {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function Users() {
  const { data: users, isLoading, isError } = useGetUsers();
  const [openNew, setOpenNew] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const deleteUser = useDeleteUser();
  
  // State for delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setOpenDetails(true);
  };

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteUser.mutateAsync({ id: userToDelete.id });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  const columns: ColumnDef<User>[] = [
    { accessorKey: "email", header: "Email" },
    { accessorKey: "firstName", header: "First Name" },
    { accessorKey: "lastName", header: "Last Name" },
    { accessorKey: "role", header: "Role" },
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
              handleUserClick(row.original.id);
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
        <h1 className="text-2xl font-bold">Users</h1>
        <Sheet open={openNew} onOpenChange={setOpenNew}>
          <SheetTrigger asChild>
            <Button onClick={() => setOpenNew(true)}>
              <Plus className="mr-2 h-4 w-4" />Add User
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-full md:!max-w-[50%] lg:!max-w-[22%] overflow-hidden">
            <SheetHeader>
              <SheetTitle>New User</SheetTitle>
            </SheetHeader>
            <NewUser onSuccess={() => setOpenNew(false)} />
          </SheetContent>
        </Sheet>
      </div>
      
      <DataTable
        columns={columns}
        data={users || []}
        searchColumn="email"
        searchPlaceholder="Search users..."
        page={1}
        pageSize={10}
        totalPages={1}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        onEditButtonClick={handleUserClick}
      />
      
      {/* User Details Sheet */}
      <Sheet open={openDetails} onOpenChange={setOpenDetails}>
        <SheetContent side="right" className="w-full sm:w-full md:!max-w-[50%] lg:!max-w-[22%] overflow-hidden">
          <SheetHeader>
            <SheetTitle>User Details</SheetTitle>
          </SheetHeader>
          {selectedUserId && (
            <UserDetails 
              userId={selectedUserId}
              onSuccess={() => setOpenDetails(false)}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteUser}
        title="Delete User"
        itemName={userToDelete?.email}
        isDeleting={isDeleting}
      />
    </div>
  );
} 