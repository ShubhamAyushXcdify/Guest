import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

// Define the product type
export interface Product {
  id: string;
  productNumber: string;
  name: string;
  genericName: string;
  category: string;
  productType: string;
  ndcNumber: string;
  dosageForm: string;
  unitOfMeasure: string;
  requiresPrescription: boolean;
  controlledSubstanceSchedule: string;
  storageRequirements: string;
  isActive: boolean;
  price: number;
  createdAt: string | null;
  updatedAt: string | null;
  reorderThreshold: number;
}

// Define the inventory data type based on the API response
export interface InventoryData {
  id: string;
  clinicId: string;
  productId: string;
  product: Product;
  lotNumber: string | null;
  batchNumber: string;
  expirationDate: string;
  dateOfManufacture: string;
  quantityOnHand: number;
  quantityReserved: number;
  reorderLevel: number;
  reorderQuantity: number;
  unitCost: number;
  wholesaleCost: number;
  retailPrice: number | null;
  unitOfMeasure: string;
  unitsPerPackage: number;
  location: string | null;
  receivedFromPo: boolean;
  poItemId: string;
  receivedDate: string;
  createdAt: string;
  updatedAt: string;
}

// Define the paginated response type
export interface PaginatedInventoryResponse {
  items: InventoryData[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export const getInventory = async (filters: {
  pageNumber?: number;
  pageSize?: number;
  productId?: string;
  clinicId?: string;
  search?: string;
  productType?: string;
  lotNumber?: string;
  quantityOnHand?: number;
  quantityReserved?: number;
  reorderLevel?: number;
  reorderQuantity?: number;
  unitCost?: number;
  wholesaleCost?: number;
  retailPrice?: number;
  location?: string;
  unitOfMeasure?: string;
  unitsPerPackage?: number;
  batchNumber?: string;
  receivedFromPo?: boolean;
  poItemId?: string;
} = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  });
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`/api/inventory${queryString}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch inventory');
  }
  return response.json() as Promise<PaginatedInventoryResponse>;
};

export function useGetInventory(filters = {}, enabled = true) {
  return useQuery({
    queryKey: ['inventory', filters],
    queryFn: () => getInventory(filters),
    enabled,
    refetchOnWindowFocus: false,
  });
}

export function useGetInventoryInfinite(filters = {}, enabled = true) {
  return useInfiniteQuery({
    queryKey: ['inventory-infinite', filters],
    queryFn: ({ pageParam = 1 }) => getInventory({ ...filters, pageNumber: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNextPage) {
        return lastPage.pageNumber + 1;
      }
      return undefined;
    },
    enabled,
    refetchOnWindowFocus: false,
  });
}

