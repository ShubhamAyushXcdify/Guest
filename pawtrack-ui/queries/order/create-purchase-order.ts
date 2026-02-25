import { useMutation, useQueryClient } from "@tanstack/react-query"

interface CreatePurchaseOrderInput {
  clinicId: string
  supplierId: string
  orderNumber: string
  orderDate: string
  expectedDeliveryDate: string
  actualDeliveryDate?: string
  status: string
  subtotal: number
  taxAmount: number
  shippingCost: number
  totalAmount: number
  notes?: string
  createdBy: string
}

export function useCreatePurchaseOrder(onSuccess: (data: any) => void , onError: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreatePurchaseOrderInput) => {
      const response = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create purchase order")
      }

      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] })
      onSuccess(data)
    },
    onError: () => {
      onError()
    },
  })
} 