// queries/dashboard/get-expiring-products.ts
import { useQuery } from "@tanstack/react-query";

export interface ExpiringProduct {
  inventoryId: string;
  productId: string;
  clinicId: string;
  expirationDate: string;
  dateOfManufacture: string;
  quantityOnHand: number;
  batchNumber: string | null;
  lotNumber: string | null;
  location: string | null;
  unitCost: number;
  wholesaleCost: number;
  retailPrice: number | null;
  receivedDate: string;
  product: {
    id: string;
    name: string;
    genericName: string;
    category: string;
    manufacturer: string | null;
    ndcNumber: string | null;
    strength: string | null;
    dosageForm: string;
    unitOfMeasure: string;
    requiresPrescription: boolean;
    controlledSubstanceSchedule: string;
    brandName: string;
    storageRequirements: string;
    isActive: boolean;
    price: number;
    sellingPrice: number | null;
  };
  clinic: {
    id: string;
    companyId: string;
    companyName: string;
    name: string;
    // ... other clinic properties
  };
}

// queries/dashboard/get-expiring-products.ts
export const useExpiringProducts = (clinicId: string) => {
  return useQuery<ExpiringProduct[]>({
    queryKey: ["expiringProducts", clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const url = `/api/dashboard/expiring-products?clinicId=${clinicId}`;
      
      const response = await fetch(url, {
        credentials: 'include' // This ensures cookies are sent with the request
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch expiring products");
      }
      
      const data = await response.json();
      return data.data || [];
    },
    enabled: !!clinicId,
  });
};