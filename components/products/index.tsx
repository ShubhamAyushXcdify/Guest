'use client'
import React, { useState } from "react";
import { DataTable } from "../ui/data-table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useGetProducts, PaginatedResponse, ProductFilters } from "@/queries/products/get-products";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import NewProduct from "./newProduct";
import ProductDetails from "./productsDetails";
import { useDeleteProduct } from "@/queries/products/delete-products";
import { toast } from "../ui/use-toast";
import { DeleteConfirmationDialog } from "../ui/delete-confirmation-dialog";
import { ProductFiltersComponent } from "./product-filters";
 
// Product type based on the provided API schema
export type Product = {
  id: string;
  clinicId: string;
  productNumber: string;
  name: string;
  genericName: string;
  category: string;
  productType: string;
  manufacturer: string;
  ndcNumber: string;
  strength: string;
  dosageForm: string;
  unitOfMeasure: string;
  requiresPrescription: boolean;
  controlledSubstanceSchedule: string;
  storageRequirements: string;
  isActive: boolean;
  reorderThreshold?: number | null; // Added optional reorderThreshold field
  price?: number; // Added price field
};
 
const PRODUCT_TYPES = ["medication", "vaccine", "supply", "food", "supplement"];
 
export default function Products() {
  const [filters, setFilters] = useState<ProductFilters>({
    pageNumber: 1,
    pageSize: 10
  });
 
  const { data: productsData, isLoading, isError } = useGetProducts(filters);
 
  // Extract product items from the paginated response
  const products = productsData?.items || [];
  const totalPages = productsData?.totalPages || 1;
 
  const [openNew, setOpenNew] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const deleteProduct = useDeleteProduct();
 
  // State for delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
 
  const handleProductClick = (productId: string) => {
    setSelectedProductId(productId);
    setOpenDetails(true);
  };
 
  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };
 
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
   
    setIsDeleting(true);
    try {
      await deleteProduct.mutateAsync({ id: productToDelete.id });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };
 
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, pageNumber: page }));
  };
 
  const handlePageSizeChange = (newPageSize: number) => {
    setFilters(prev => ({ 
      ...prev, 
      pageSize: Number(newPageSize),
      pageNumber: 1 // Reset to first page when changing page size
    }));
  };
 
  const handleFiltersChange = (newFilters: ProductFilters) => {
    setFilters(prev => ({ 
      ...newFilters, 
      pageNumber: 1 // Reset to first page when filters change
    }));
  };
 
  const handleClearFilters = () => {
    setFilters({
      pageNumber: 1,
      pageSize: filters.pageSize || 10
    });
  };
 
  const columns: ColumnDef<Product>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "genericName", header: "Generic Name" },
    { accessorKey: "category", header: "Category" },
    { accessorKey: "productType", header: "Product Type" },
    // { accessorKey: "manufacturer", header: "Manufacturer" },
    // { accessorKey: "strength", header: "Strength" },
    {
      accessorKey: "requiresPrescription",
      header: "Rx Required",
      cell: ({ getValue }) => <Badge variant={getValue() ? "default" : "outline"}>{getValue() ? "Yes" : "No"}</Badge>
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ getValue }) => <Badge variant={getValue() ? "default" : "destructive"}>{getValue() ? "Active" : "Inactive"}</Badge>
    },
    { accessorKey: "reorderThreshold", header: "Threshold", cell: ({ getValue }) => getValue() ?? '-' },
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
              handleProductClick(row.original.id);
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
        <h1 className="text-2xl font-bold">Products</h1>
        <Sheet open={openNew} onOpenChange={setOpenNew}>
          <SheetTrigger asChild>
            <Button className={`theme-button text-white`} onClick={() => setOpenNew(true)}>
              <Plus className="mr-2 h-4 w-4" />Add Product
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-full md:!max-w-[50%] lg:!max-w-[37%] overflow-hidden">
            <SheetHeader>
              <SheetTitle>New Product</SheetTitle>
            </SheetHeader>
            <NewProduct onSuccess={() => setOpenNew(false)} />
          </SheetContent>
        </Sheet>
      </div>
     
      {/* Product Filters */}
      <ProductFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />
     
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <p>Loading products...</p>
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center h-32">
          <p className="text-red-500">Error loading products</p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex items-center justify-center h-32">
          <p>No products found. Click "Add Product" to create one.</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={products as Product[]}
          searchColumn="name"
          searchPlaceholder="Search products..."
          page={filters.pageNumber || 1}
          pageSize={filters.pageSize || 10}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSearch={(value) => handleFiltersChange({ ...filters, search: value, pageNumber: 1 })}
          onEditButtonClick={handleProductClick}
        />
      )}
     
      {/* Product Details Sheet */}
      <Sheet open={openDetails} onOpenChange={setOpenDetails}>
        <SheetContent side="right" className="w-full sm:w-full md:!max-w-[50%] lg:!max-w-[37%] overflow-hidden">
          <SheetHeader>
            <SheetTitle>Product Details</SheetTitle>
          </SheetHeader>
          {selectedProductId && (
            <ProductDetails
              productId={selectedProductId}
              onSuccess={() => setOpenDetails(false)}
            />
          )}
        </SheetContent>
      </Sheet>
 
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteProduct}
        title="Delete Product"
        itemName={productToDelete?.name}
        isDeleting={isDeleting}
      />
    </div>
  );
}