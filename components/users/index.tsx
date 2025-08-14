'use client'
import React, { useState, useMemo, useEffect } from "react";
import { DataTable } from "../ui/data-table";
import { Button } from "../ui/button";
import { Badge, BadgeProps } from "../ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useGetUsers } from "@/queries/users/get-users";
import { useGetRole } from "@/queries/roles/get-role";
import { useGetClinic } from "@/queries/clinic/get-clinic";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import NewUser from "./newUser";
import UserDetails from "./userDetails";
import { useDeleteUser } from "@/queries/users/delete-user";
import { toast } from "@/hooks/use-toast";
import { DeleteConfirmationDialog } from "../ui/delete-confirmation-dialog";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { useRootContext } from "@/context/RootContext";
import { getCompanyId } from "@/utils/clientCookie";

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
  clinicName?: string;
  clinicIds?: string[]; // Array of clinic IDs as per API
  companyId?: string; // Added for superadmin functionality
  slots?: string[]; // Array of slot IDs as per API
  clinic?: {
    id: string;
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    email: string;
    website?: string;
    taxId: string;
    licenseNumber: string;
    subscriptionStatus?: string;
    subscriptionExpiresAt?: string;
    createdAt: string;
    updatedAt: string;
    location?: {
      lat: number;
      lng: number;
      address: string;
    };
  };
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export default function Users() {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');
  const [companyId, setCompanyId] = useState<string | null>(null);
  const { userType, clinic, user: currentUser } = useRootContext();

  const debouncedSearch = useDebounce(handleSearch, 300);
  
  const queryClient = useQueryClient();

  // Set company ID from root context or local storage for Administrator users
  useEffect(() => {
    if (userType?.isAdmin || currentUser?.roleName === 'Administrator') {
      if (currentUser?.companyId) {
        setCompanyId(currentUser.companyId);
      } else {
        const storedCompanyId = getCompanyId();
        if (storedCompanyId) {
          setCompanyId(storedCompanyId);
        }
      }
    }
  }, [userType?.isAdmin, currentUser?.roleName, currentUser?.companyId]);

  React.useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["role"] });
    queryClient.invalidateQueries({ queryKey: ["users"] });
    queryClient.refetchQueries({ queryKey: ["role"] });
    queryClient.refetchQueries({ queryKey: ["users"] });
  }, [queryClient]);

  const { data: rolesData, isLoading: isRolesLoading, isError: isRolesError } = useGetRole(1, 1000, '', true); // Fetch all roles for color mapping

  // Fetch clinics for Administrator users
  const { data: clinicData } = useGetClinic(1, 100, companyId, !!(userType?.isAdmin || currentUser?.roleName === 'Administrator') && !!companyId);

  // Set first clinic as default when clinic data is loaded
  useEffect(() => {
    if (clinicData?.items && clinicData.items.length > 0 && !selectedClinicId) {
      setSelectedClinicId(clinicData.items[0].id);
    }
  }, [clinicData?.items, selectedClinicId]);

  // Reset pagination when clinic selection changes
  useEffect(() => {
    setPageNumber(1);
  }, [selectedClinicId]);

  // Determine clinic ID based on user role
  const clinicId = useMemo(() => {
    if (userType?.isClinicAdmin || userType?.isVeterinarian) {
      return clinic?.id || '';
    } else if (userType?.isAdmin || currentUser?.roleName === 'Administrator') {
      return selectedClinicId; // Use selected clinic for Administrator users
    }
    return '';
  }, [userType?.isClinicAdmin, userType?.isVeterinarian, userType?.isAdmin, currentUser?.roleName, clinic?.id, selectedClinicId]);

  // For superadmin, get Administrator role ID to filter users
  const administratorRole = rolesData?.data?.find((role: any) => role.name === 'Administrator');
  const roleIdForQuery = userType?.isSuperAdmin ? (administratorRole?.id || '') : '';

  const { data: usersData, isLoading: isUsersLoading, isError: isUsersError } = useGetUsers(
    pageNumber,
    pageSize,
    search,
    clinicId, // Pass the clinic ID based on user role
    !!rolesData, // enabled
    roleIdForQuery // Pass roleId for superadmin to filter Administrator users
  );

  // Filter users based on role priority
  const filteredUsers = useMemo(() => {
    if (!usersData?.items || !rolesData?.data || !currentUser?.roleId) {
      return [];
    }

    // For superadmin, show all Administrator users (already filtered by roleId in query)
    if (userType?.isSuperAdmin) {
      return usersData.items;
    }

    // Get current user's role priority
    const currentUserRole = rolesData.data.find((role: any) => role.id === currentUser.roleId);
    const currentUserPriority = currentUserRole?.priority || 0;

    // Filter users to show only those with higher priority number (lower privilege)
    return usersData.items.filter(user => {
      const userRole = rolesData.data.find((role: any) => role.id === user.roleId);
      const userPriority = userRole?.priority || 0;

      // Keep users with higher priority values (lower privilege)
      return userPriority > currentUserPriority;
    });
  }, [usersData?.items, rolesData?.data, currentUser?.roleId, userType?.isSuperAdmin]);

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



  // Clinic options for Administrator users
  const clinicOptions = React.useMemo(() => {
    return clinicData?.items?.map((clinic) => ({
      id: clinic.id,
      name: clinic.name
    })) || [];
  }, [clinicData?.items]);

  const [openNew, setOpenNew] = useState(false);
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
        title: "User Deleted",
        description: "User has been deleted successfully",
        variant: "success",
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "error",
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

  function handleSearch(value: string) {
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
        <h1 className="text-2xl font-bold">{userType?.isSuperAdmin ? "Admins" : "Users"}</h1>
        <div className="flex flex-row gap-2">
            {!userType.isClinicAdmin && !userType.isSuperAdmin && (
              <Button className={`theme-button text-white`} onClick={openRolePage}>
                Manage Roles
              </Button>
            )}
        <Sheet open={openNew} onOpenChange={setOpenNew}>
          <SheetTrigger asChild>
            <Button className={`theme-button text-white`} onClick={() => setOpenNew(true)}>
              <Plus className="mr-2 h-4 w-4" />{userType?.isSuperAdmin ? "Add Admin" : "Add User"}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-full md:!max-w-[50%] lg:!max-w-[22%] overflow-hidden">
            <SheetHeader>
              <SheetTitle>{userType?.isSuperAdmin ? "New Admin" : "New User"}</SheetTitle>
            </SheetHeader>
            <NewUser onSuccess={() => {
              setOpenNew(false);
            }} />
          </SheetContent>
        </Sheet>
        </div>
      </div>

      {/* Clinic Selection for Administrator users */}
      {(userType?.isAdmin || currentUser?.roleName === 'Administrator') && (
        <div className="flex items-center gap-4">
          <div className="w-64">
            <Select value={selectedClinicId} onValueChange={setSelectedClinicId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a clinic" />
              </SelectTrigger>
              <SelectContent>
                {clinicOptions.map((clinic) => (
                  <SelectItem key={clinic.id} value={clinic.id}>
                    {clinic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

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
            data={filteredUsers as User[]}
            searchColumn="firstName"
            searchPlaceholder="Search users by name or email..."
            page={pageNumber}
            pageSize={pageSize}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onSearch={debouncedSearch}
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