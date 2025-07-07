"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Eye } from "lucide-react"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet"
import { Client, useGetClients } from "@/queries/clients/get-client"
import { useDebounce } from "@/hooks/use-debounce"
import { ClientDrawerContent } from "./clientDrawer"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { useDeleteClient } from "@/queries/clients/delete-client"
import { toast } from "@/components/ui/use-toast"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useRouter } from "next/navigation"


export const ClientsScreen = () => {
  const [isClientDrawerOpen, setIsClientDrawerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  
  const { data: clientsData, isLoading, isError } = useGetClients(
    page,
    pageSize,
    debouncedSearchQuery
  )
  
  const clients = clientsData?.items || []
  const totalPages = clientsData?.totalPages || 1

  const deleteClientMutation = useDeleteClient();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter()


  const handleSearch = (searchTerm: string) => {
    setSearchQuery(searchTerm)
    setPage(1) // Reset to first page on new search
    
    // Update URL with search parameter but don't expose specific fields
    const url = new URL(window.location.href);
    url.searchParams.set('search', encodeURIComponent(searchTerm));
    
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

  const handleEditClient = (client?: Client | null) => {
    setSelectedClient(client || null);
    setIsClientDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsClientDrawerOpen(false);
    setSelectedClient(null);
  };

  const openDeleteDialog = (client: Client) => {
    setClientToDelete(client);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteClientMutation.mutateAsync(clientToDelete.id);
      toast({
        title: "Success",
        description: "Owner deleted successfully",
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete owner",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setClientToDelete(null);
    }
  };

  const columns: ColumnDef<Client>[] = [
    { accessorKey: "firstName", header: "First Name" },
    { accessorKey: "lastName", header: "Last Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phonePrimary", header: "Phone" },
    { accessorKey: "isActive", header: "Active", cell: ({ getValue }) => getValue() ? "Yes" : "No" },
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
              handleEditClient(row.original);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/clients/${row.original.id}`);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {/* <Button 
            variant="ghost" 
            size="icon"
            className="text-red-500 hover:text-red-700 hover:bg-red-100"
            onClick={(e) => {
              e.stopPropagation();
              openDeleteDialog(row.original);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button> */}
        </div>
      ),
      meta: { className: "text-center" },
    },
  ];


  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">Owners</h1>
        <Sheet open={isClientDrawerOpen} onOpenChange={setIsClientDrawerOpen}>
          <SheetTrigger asChild>
            <Button className={`theme-button text-white`} onClick={() => handleEditClient(null)}>
              <Plus className="mr-2 h-4 w-4" /> Add Owner
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-full md:!max-w-[40%] overflow-auto">
            <SheetHeader>
              <SheetTitle>{selectedClient ? "Update Owner" : "New Owner"}</SheetTitle>
            </SheetHeader>
            <ClientDrawerContent 
              onClose={handleDrawerClose} 
              defaultValues={selectedClient || undefined}
              isUpdate={!!selectedClient} 
            />
          </SheetContent>
        </Sheet>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading owners...</p>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-destructive">Error loading owners. Please try again.</p>
          </div>
        ) : (
          <>
            
            <div 
              onKeyDown={(e) => { 
                // Prevent form submission when pressing Enter
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              className="search-container"
            >
              <DataTable
                columns={columns}
                data={clients as Client[]}
                searchColumn="firstName"
                searchPlaceholder="Search owners by first or last name..."
                page={page}
                pageSize={pageSize}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                onSearch={handleSearch}
              />
            </div>
          </>
        )}
      </div>
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteClient}
        itemName={clientToDelete?.firstName + " " + clientToDelete?.lastName}
        isDeleting={isDeleting}
      />
    </div>
  )
} 