import { useMutation, useQueryClient } from "@tanstack/react-query"

interface CreatePurchaseOrderItemInput {
  purchaseOrderId: string
  productId: string
  quantityOrdered: number
  quantityReceived: number
  unitCost: number
  totalCost: number
  lotNumber: string
  expirationDate: string
}

export function useCreatePurchaseOrderItem(onSuccess: (data: any) => void , onError: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreatePurchaseOrderItemInput) => {
      const response = await fetch("/api/purchase-order-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create purchase order item")
      }

      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-order-items"] })
      onSuccess(data)
    },
    onError: () => {
      onError()
    },
  })
} 