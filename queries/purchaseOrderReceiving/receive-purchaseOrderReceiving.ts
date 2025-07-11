import { useMutation } from "@tanstack/react-query";

export async function receivePurchaseOrderReceiving(data: any) {
  const response = await fetch("/api/purchaseOrderReceiving/receive", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to receive purchase order");
  }
  return response.json();
}

export function useReceivePurchaseOrderReceiving() {
  return useMutation({ mutationFn: receivePurchaseOrderReceiving });
} 