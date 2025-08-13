'use client'
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "../ui/data-table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Plus, Trash2, Filter, Eye } from "lucide-react";
import { useGetProducts, PaginatedResponse } from "@/queries/products/get-products";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import NewProduct from "./newProduct";
import ProductDetails from "./productsDetails";
import { useDeleteProduct } from "@/queries/products/delete-products";
import { useToast } from "@/hooks/use-toast";
import { DeleteConfirmationDialog } from "../ui/delete-confirmation-dialog";
import { useFilter } from "./hooks/useFilter";
import ProductFilterDialog from "./ProductFilterDialog";
 
// Product type based on the provided API schema
export type Product = {
  id: string;
  clinicId: string;
  productNumber: string;
  name: string;
  brandName: string; // <-- Added brandName
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
  sellingPrice?: number; // Added sellingPrice field
};
 
const PRODUCT_TYPES = ["medication", "vaccine", "supply", "food", "supplement"];
 
export default function Products() {
  const router = useRouter();
  const { searchParam, setSearchParam, handleSearch } = useFilter();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const { toast } = useToast();
 
  const { data: productsData, isLoading, isError } = useGetProducts(
    pageNumber, 
    pageSize, 
    searchParam
  );
 
  // Extract product items from the paginated response
  const products = productsData?.items || [];
  const totalPages = productsData?.totalPages || 1;
 
  const [openNew, setOpenNew] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const deleteProduct = useDeleteProduct();
 
  // State for delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
 
  const handleProductClick = (productId: string) => {
    setSelectedProductId(productId);
    setOpenDetails(true);
  };

  const handleViewProduct = (productId: string) => {
    router.push(`/products/${productId}`);
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
        title: "Product Deleted",
        description: `Product ${productToDelete.name} deleted successfully`,
        variant: "success",
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred while deleting the product.",
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };
 
  const handlePageChange = (page: number) => {
    setPageNumber(page);
  };
 
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(Number(newPageSize));
    setPageNumber(1); // Reset to first page when changing page size
  };
 
  const handleTableSearch = (value: string) => {
    setSearch(value);
    // Only update URL params if there are no active filters, otherwise let the filter dialog handle it
    if (!searchParam.category && !searchParam.productType) {
      handleSearch("searchByname", value);
    }
    setPageNumber(1); // Reset to first page when searching
  };

  // Reset page when filters change
  React.useEffect(() => {
    setPageNumber(1);
  }, [searchParam.searchByname, searchParam.category, searchParam.productType]);
 
  const columns: ColumnDef<Product>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "brandName", header: "Brand Name" }, // <-- Added Brand Name column
    { accessorKey: "genericName", header: "Generic Name" },
    { accessorKey: "category", header: "Category" },
    { accessorKey: "productType", header: "Product Type" },
    // { accessorKey: "brandName", header: "Brand Name" },
    // { accessorKey: "manufacturer", header: "Manufacturer" },
    // { accessorKey: "strength", header: "Strength" },
    {
      accessorKey: "price",
      header: "Cost Price",
      cell: ({ getValue }) => {
        const value = getValue() as number;
        return value ? `${value.toFixed(2)}` : '-';
      }
    },
    {
      accessorKey: "sellingPrice",
      header: "Selling Price",
      cell: ({ getValue }) => {
        const value = getValue() as number;
        return value ? `${value.toFixed(2)}` : '-';
      }
    },
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
              handleViewProduct(row.original.id);
            }}
            title="View Product Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleProductClick(row.original.id);
            }}
            title="Edit Product"
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
            title="Delete Product"
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
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Products</h1>
          {/* Active Filters Display */}
          {(searchParam.searchByname || searchParam.category || searchParam.productType) && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              <div className="flex gap-1">
                {searchParam.searchByname && (
                  <Badge variant="secondary" className="text-xs">
                    Name: {searchParam.searchByname}
                  </Badge>
                )}
                {searchParam.category && (
                  <Badge variant="secondary" className="text-xs">
                    Category: {searchParam.category.replace(/_/g, " ")}
                  </Badge>
                )}
                {searchParam.productType && (
                  <Badge variant="secondary" className="text-xs">
                    Type: {searchParam.productType}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setOpenFilter(true)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filter
            {(searchParam.searchByname || searchParam.category || searchParam.productType) && (
              <Badge variant="default" className="ml-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                {(searchParam.searchByname ? 1 : 0) + (searchParam.category ? 1 : 0) + (searchParam.productType ? 1 : 0)}
              </Badge>
            )}
          </Button>
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
      </div>
     
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
          page={pageNumber}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSearch={handleTableSearch}
          onEditButtonClick={handleProductClick}
        />
      )}
     
      {/* Product Details Sheet */}
      <Sheet open={openDetails} onOpenChange={setOpenDetails}>
        <SheetContent side="right" className="w-full sm:w-full md:!max-w-[80%] lg:!max-w-[50%] overflow-hidden">
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

      {/* Filter Dialog */}
      <ProductFilterDialog
        isOpen={openFilter}
        onOpenChange={setOpenFilter}
      />
    </div>
  );
}