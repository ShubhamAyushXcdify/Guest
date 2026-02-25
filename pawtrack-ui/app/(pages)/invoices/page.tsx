"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"

interface Invoice {
  id: string
  invoiceNumber: string
  status: "paid" | "unpaid"
  totalAmount: number
  consultationFee: number
  discount: number
  createdAt: string
  visit: {
    id: string
    appointment: {
      id: string
      patient: {
        name: string
      }
      client: {
        name: string
      }
    }
  }
}

const getInvoices = async (searchParams: URLSearchParams) => {
  try {
    const response = await fetch(`/api/invoice?${searchParams.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Invoice API error response:", errorData)
      throw new Error(errorData.message || 'Failed to fetch invoices')
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error("Error in getInvoices function:", error)
    throw error
  }
}

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid">("all")

  const searchParams = new URLSearchParams()
  if (searchQuery) searchParams.set("search", searchQuery)
  if (statusFilter !== "all") searchParams.set("status", statusFilter)
  searchParams.set("pageNumber", "1")
  searchParams.set("pageSize", "50")

  const { data: invoiceData, isLoading, error } = useQuery({
    queryKey: ["invoices", searchQuery, statusFilter],
    queryFn: () => getInvoices(searchParams)
  })

  const invoices = invoiceData?.invoices || []

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/invoices/new">
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "paid" | "unpaid")}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <p>Loading invoices...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>Error loading invoices: {(error as Error).message}</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No invoices found</p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice: Invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>
                        {invoice.visit?.appointment?.client?.name || "-"}
                      </TableCell>
                      <TableCell>
                        {invoice.visit?.appointment?.patient?.name || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>
                          {invoice.status === "paid" ? "Paid" : "Unpaid"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        ${invoice.totalAmount?.toFixed(2) || "0.00"}
                      </TableCell>
                      <TableCell>
                        {invoice.createdAt 
                          ? new Date(invoice.createdAt).toLocaleDateString()
                          : "-"
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Link href={`/invoice?visitId=${invoice.visit?.id}&appointmentId=${invoice.visit?.appointment?.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="h-8 w-8 text-green-500 hover:text-green-700 hover:bg-green-50"
                          >
                            <Link href={`/invoice?visitId=${invoice.visit?.id}&appointmentId=${invoice.visit?.appointment?.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}