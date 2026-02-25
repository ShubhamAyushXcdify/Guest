import { keepPreviousData, useQuery } from "@tanstack/react-query";

export type Expense = {
  id: string;
  clinicId: string;
  dateOfExpense: string;
  category: string;
  amount: number;
  paymentMode: string;
  paidTo: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  clinicDetail?: {
    id: string;
    companyId: string;
    companyName: string;
    name: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    email: string;
    website: string;
    description: string;
    taxId: string;
    licenseNumber: string;
    subscriptionStatus: string;
    subscriptionExpiresAt: string;
    createdAt: string;
    updatedAt: string;
    location?: {
      lat: number;
      lng: number;
      address: string;
    };
  };
};

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  clinicIds?: string[];
}

const getExpense = async (
  pageNumber = 1,
  pageSize = 10,
  clinicId: string | null = null,
  companyId: string | null = null,
  filters: ExpenseFilters = {}
) => {
  const params = new URLSearchParams({
    pageNumber: String(pageNumber),
    pageSize: String(pageSize),
  });

  if (clinicId) params.append('clinicId', clinicId);
  if (companyId) params.append('companyId', companyId);

  if (filters.clinicIds && filters.clinicIds.length > 0) {
    filters.clinicIds.forEach((id) => params.append("clinicIds", id));
  }

  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate) params.append("endDate", filters.endDate);
  


  const response = await fetch(`/api/expense?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch expense data');
  }

  return response.json() as Promise<PaginatedResponse<Expense>>;
};

export const useGetExpense = (
  pageNumber = 1,
  pageSize = 10,
  clinicId: string | null = null,
  companyId: string | null = null,
  filters: ExpenseFilters = {},
  enabled: boolean = true
) => {
  return useQuery<PaginatedResponse<Expense>, Error>({
    queryKey: ["expense", pageNumber, pageSize, clinicId, companyId, filters],
    queryFn: () => getExpense(pageNumber, pageSize, clinicId, companyId, filters),
    refetchOnWindowFocus: false,
    enabled: enabled,
  });
};