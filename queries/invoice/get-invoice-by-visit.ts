import { useQuery } from "@tanstack/react-query"

const getInvoiceByVisit = async (visitId: string) => {
  try {
    if (!visitId) {
      throw new Error("visitId is required");
    }
    
    const response = await fetch(`/api/invoice/by-visit/${visitId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null // No invoice found for this visit
      }
      const errorData = await response.json().catch(() => ({}))
      console.error("Invoice API error response:", errorData)
      throw new Error(errorData.message || 'Failed to fetch invoice')
    }

    const result = await response.json()
    
    // Handle null response (no data found)
    if (result === null) {
      return null;
    }
    
    return result
  } catch (error) {
    console.error("Error in getInvoiceByVisit function:", error)
    throw error
  }
}

export const useGetInvoiceByVisit = (visitId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["invoice", "by-visit", visitId],
    queryFn: () => getInvoiceByVisit(visitId),
    enabled: enabled && !!visitId
  })
}