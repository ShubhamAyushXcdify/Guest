import { useQuery } from "@tanstack/react-query";

export interface LowStockItem {
  productId: string;
  productName: string;
  threshold: number;
  currentItemUnits: number;
}

export interface InventoryDashboard {
  totalItems: number;
  lowStockItemsCount: number;
  expiringSoonItems: number;
  pendingPurchaseOrders: number;
  lowStockItems: LowStockItem[];
  numberOfMedicalSupplies: number;
  numberOfAntibiotics: number;
  numberOfPainManagement: number;
  numberOfVaccines: number;
  numberOfSupplements: number;
  numberOfEquipment: number;
  numberOfFood: number;
  numberOfOther: number;
}

const getInventoryDashboard = async (clinicId: string): Promise<InventoryDashboard> => {
  try {
    if (!clinicId) {
      throw new Error("Clinic ID is required");
    }
    const url = `/api/inventory/dashboard/${clinicId}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch inventory dashboard");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching inventory dashboard:", error);
    throw error;
  }
};

export function useGetInventoryDashboard(clinicId: string) {
  return useQuery<InventoryDashboard>({
    queryKey: ['inventory-dashboard', clinicId],
    queryFn: () => getInventoryDashboard(clinicId),
    enabled: !!clinicId,
  });
} 