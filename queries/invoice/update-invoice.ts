import { useMutation, useQueryClient } from "@tanstack/react-query"

interface UpdateInvoiceRequest {
  invoiceNumber: string
  itemsTotal: number
  consultationFee: number
  consultationDiscountPercentage: number
  consultationDiscount: number
  consultationFeeAfterDiscount: number
  overallProductDiscount: number
  overallProductDiscountPercentage: number
  clinicId: string
  notes: string
  total: number
  status: string
  paymentMethod?: string
  products: {
    purchaseOrderReceivingHistoryId: string;
    quantity: number;
    isGiven: boolean;
    discount: number;
    discountPercentage: number;
  }[];
}

interface UpdateInvoiceData {
  id: string;
  request: UpdateInvoiceRequest;
}

const updateInvoice = async (data: UpdateInvoiceData) => {
  try {
    const { id, request } = data
    const response = await fetch(`/api/invoice/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Invoice API error response:", errorData)
      throw new Error(errorData.message || 'Failed to update invoice')
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error("Error in updateInvoice function:", error)
    throw error
  }
}

export const useUpdateInvoice = (options?: {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateInvoice,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
      queryClient.invalidateQueries({ queryKey: ["invoice"] })
      queryClient.invalidateQueries({ queryKey: ["patient-invoices"] })
      options?.onSuccess?.(data)
    },
    onError: options?.onError
  })
}