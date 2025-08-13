'use client'
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Trash2, Building } from "lucide-react";
import { Company, useGetCompanies } from "@/queries/companies/get-company";
import { useDeleteCompany } from "@/queries/companies/delete-comapny";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { toast } from "@/components/ui/use-toast";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface CompaniesScreenProps {
  onEditCompany?: (company: Company | null) => void;
}

export default function CompaniesScreen({ onEditCompany }: CompaniesScreenProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteCompanyMutation = useDeleteCompany();

  const { data, isLoading, isError } = useGetCompanies(true);

  const companies = data || [];

  const openDeleteDialog = (company: Company) => {
    setCompanyToDelete(company);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteCompanyMutation.mutateAsync(companyToDelete.id);
      toast({
        title: "Success",
        description: "Company deleted successfully",
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete company",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setCompanyToDelete(null);
    }
  };

  const columns: ColumnDef<Company>[] = [
    { 
      accessorKey: "name", 
      header: "Company Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      )
    },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "Phone" },
    { 
      accessorKey: "address", 
      header: "Location",
      cell: ({ row }) => {
        const address = row.original.address;
        return `${address?.city}, ${address?.state}`;
      }
    },
    { 
      accessorKey: "status", 
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue() as string;
        return (
          <Badge variant={status === "active" ? "default" : "secondary"}>
            {status}
          </Badge>
        );
      }
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <div className="flex gap-2 justify-center">
          {onEditCompany && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={(e) => {
                e.stopPropagation();
                onEditCompany(row.original);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/companies/${row.original.id}`);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              openDeleteDialog(row.original);
            }}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
      meta: { className: "text-center" },
    },
  ];

  return (
    <div className="p-6">
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading companies...</p>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-destructive">Error loading companies. Please try again.</p>
          </div>
        ) : (
          <>
            <div 
              onKeyDown={(e) => { 
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              className="search-container"
            >
              <DataTable
                columns={columns}
                data={companies as Company[]}
                page={1}
                pageSize={companies.length || 10}
                totalPages={1}
                onPageChange={() => {}}
                onPageSizeChange={() => {}}
              />
            </div>
          </>
        )}
      </div>
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteCompany}
        itemName={companyToDelete?.name}
        isDeleting={isDeleting}
      />
    </div>
  );
}
