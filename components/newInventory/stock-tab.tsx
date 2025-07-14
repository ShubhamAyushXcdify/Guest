"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { useGetInventoryInfinite } from "@/queries/inventory/get-inventory"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { InventoryData } from "@/queries/inventory/get-inventory"

interface StockTabProps {
  clinicId: string
}

export default function StockTab({ clinicId }: StockTabProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useGetInventoryInfinite(
    { 
      clinicId,
      pageSize,
      search: searchQuery
    },
    true
  )

  const getStockStatus = (quantityOnHand: number, reorderThreshold: number) => {
    if (quantityOnHand <= 0) {
      return { text: "Out of Stock", color: "bg-red-100 text-red-800" }
    } else if (reorderThreshold > 0 && quantityOnHand <= reorderThreshold) {
      return { text: "Low Stock", color: "bg-red-100 text-red-800" }
    } else if (reorderThreshold > 0 && quantityOnHand <= reorderThreshold * 1.5) {
      return { text: "Warning", color: "bg-amber-100 text-amber-800" }
    } else {
      return { text: "In Stock", color: "bg-green-100 text-green-800" }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleSearch = (searchTerm: string) => {
    setSearchQuery(searchTerm)
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(1)
  }

  const columns: ColumnDef<InventoryData>[] = [
    { 
      accessorKey: "product.name", 
      header: "Item Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.product?.name || 'N/A'}</div>
      )
    },
    // { 
    //   accessorKey: "lotNumber", 
    //   header: "Lot Number",
    //   cell: ({ row }) => (
    //     <div>{row.original.lotNumber || 'N/A'}</div>
    //   )
    // },
    { 
      accessorKey: "batchNumber", 
      header: "Batch Number",
      cell: ({ row }) => (
        <div>{row.original.batchNumber || 'N/A'}</div>
      )
    },
    { 
      accessorKey: "quantityOnHand", 
      header: "Current Stock",
      cell: ({ row }) => {
        const quantity = row.original.quantityOnHand
        const reorderThreshold = row.original.product?.reorderThreshold || 0
        const isLowStock = reorderThreshold > 0 && quantity <= reorderThreshold
        const isWarning = reorderThreshold > 0 && quantity <= reorderThreshold * 1.5
        
        return (
          <div className={`font-medium ${
            isLowStock ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-gray-900 dark:text-gray-200'
          }`}>
            {quantity}
          </div>
        )
      }
    },
    { 
      accessorKey: "product.reorderThreshold", 
      header: "Min Threshold",
      cell: ({ row }) => (
        <div>{row.original.product?.reorderThreshold || 'N/A'}</div>
      )
    },
    { 
      accessorKey: "unitCost", 
      header: "Unit Cost",
      cell: ({ row }) => (
        <div>₹{row.original.unitCost?.toFixed(2) || '0.00'}</div>
      )
    },
    { 
      accessorKey: "expirationDate", 
      header: "Expiration",
      cell: ({ getValue }) => formatDate(getValue() as string)
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = getStockStatus(row.original.quantityOnHand, row.original.product?.reorderThreshold || 0)
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
            {status.text}
          </span>
        )
      }
    },
    // {
    //   id: "actions",
    //   header: () => <div className="text-center">Actions</div>,
    //   cell: ({ row }) => {
    //     const reorderThreshold = row.original.product?.reorderThreshold || 0
    //     const isLowStock = reorderThreshold > 0 && row.original.quantityOnHand <= reorderThreshold
    //     return (
    //       <div className="flex gap-2 justify-center">
    //         <Button 
    //           variant="secondary" 
    //           size="sm" 
    //           className="theme-button-secondary"
    //         >
    //           {isLowStock ? 'Order' : 'Adjust'}
    //         </Button>
    //       </div>
    //     )
    //   },
    //   meta: { className: "text-center" },
    // },
  ]
  const allItems = data?.pages.flatMap(page => page.items) || []
  const totalPages = data?.pages[0]?.totalPages || 1

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Stock Management</h3>
      </div>
      
      <DataTable
        columns={columns}
        data={allItems}
        searchPlaceholder="Search inventory..."
        onSearch={handleSearch}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  )
}
