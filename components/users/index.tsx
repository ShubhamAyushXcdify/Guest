'use client'
import React, { useState } from "react";
import { DataTable } from "../ui/data-table";
import { Button } from "../ui/button";
import { Badge, BadgeProps } from "../ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useGetUsers } from "@/queries/users/get-users";
import { useGetRole } from "@/queries/roles/get-role";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import NewUser from "./newUser";
import UserDetails from "./userDetails";
import { useDeleteUser } from "@/queries/users/delete-user";
import { toast } from "../ui/use-toast";
import { DeleteConfirmationDialog } from "../ui/delete-confirmation-dialog";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";

// User type based on the provided API schema
export type User = {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: string;
  roleId: string; 
  roleName: string;
  clinicId?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function Users() {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  
  const debouncedSearch = useDebounce(search, 300);
  
  const queryClient = useQueryClient();

  React.useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["role"] });
    queryClient.invalidateQueries({ queryKey: ["users"] });
    queryClient.refetchQueries({ queryKey: ["role"] });
    queryClient.refetchQueries({ queryKey: ["users"] });
  }, [queryClient]);

  const { data: rolesData, isLoading: isRolesLoading, isError: isRolesError } = useGetRole(1, 1000, '', true); // Fetch all roles for color mapping

  const { data: usersData, isLoading: isUsersLoading, isError: isUsersError } = useGetUsers(
    pageNumber, 
    pageSize, 
    debouncedSearch, 
    '', // clinicId
    !!rolesData, // enabled
    '' // roleId
  );

  const users = usersData?.items || [];
  const totalPages = usersData?.totalPages || 1;
  

   const roleColors = React.useMemo(() => {
    const colors: { [key: string]: string } = {};
    if (rolesData?.data) {
      rolesData.data.forEach((role: any) => {
        colors[role.name] = role.colourName;
      });
    }
    return colors;
  }, [rolesData]);

  const [openNew, setOpenNew] = useState(false);
  const [openRole, setOpenRole] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const deleteUser = useDeleteUser();
  
  // State for delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();
  
  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setOpenDetails(true);
  };

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const openRolePage = () => {
    router.push("/roles")
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteUser.mutateAsync({ id: userToDelete.id });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      setIsDeleteDialogOpen(false);
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

  const columns: ColumnDef<User>[] = [
    { accessorKey: "firstName", header: "First Name" },
    { accessorKey: "lastName", header: "Last Name" },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const roleDisplayName = row.original.roleName as string;
        const colorValue = roleColors[roleDisplayName];

        let badgeProps: BadgeProps = {};

        if (colorValue) {
          badgeProps.style = { backgroundColor: colorValue };
        } else {
          // Fallback to default color if no role-specific color is found
          badgeProps.style = { backgroundColor: "#999999" };
        }

        return <Badge {...badgeProps}>{roleDisplayName}</Badge>;
      },
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
        <div className="flex flex-row gap-2">
            <Button onClick={openRolePage}>
              Manage Roles
        </Button>
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
            <NewUser onSuccess={() => {
              setOpenNew(false);
            }} />
          </SheetContent>
        </Sheet>
        </div>
      </div>
      
      {isUsersLoading || isRolesLoading || !rolesData?.data ? (
        <div className="flex items-center justify-center h-32">
          <p>Loading users...</p>
        </div>
      ) : isUsersError || isRolesError ? (
        <div className="flex items-center justify-center h-32">
          <p className="text-red-500">Error loading users</p>
        </div>
      ) : (
        <div onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}>
          <DataTable
            columns={columns}
            data={users as User[]}
            searchColumn="firstName"
            searchPlaceholder="Search users by name or email..."
            page={pageNumber}
            pageSize={pageSize}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onSearch={handleSearch}
          />
        </div>
      )}
      
      {/* User Details Sheet */}
      <Sheet open={openDetails} onOpenChange={setOpenDetails}>
        <SheetContent side="right" className="w-full sm:w-full md:!max-w-[50%] lg:!max-w-[22%] overflow-hidden">
          <SheetHeader>
            <SheetTitle>User Details</SheetTitle>
          </SheetHeader>
          {selectedUserId && (
            <UserDetails 
              userId={selectedUserId}
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
        onConfirm={handleDeleteUser}
        title="Delete User"
        itemName={userToDelete?.email}
        isDeleting={isDeleting}
      />
    </div>
  );
} 