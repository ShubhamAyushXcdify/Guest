import { keepPreviousData, useQuery } from "@tanstack/react-query";

export type Clinic = {
  id: string;
  companyId: string;
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
  taxId: string;
  licenseNumber: string;
  createdAt: string | null;
  updatedAt: string | null;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  distance: number;
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

export interface ApiResponse<T> {
  data: T;
}

export interface ClinicFilters {
  name?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  email?: string;
}

const getClinic = async (
  pageNumber = 1,
  pageSize = 10,
  companyId: string | null,
  userId?: string | null,
  filters: ClinicFilters = {}
) => {
  // Build query parameters
  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
    paginationRequired: 'true'
  });

  if (companyId) {
    params.append('companyId', companyId);
  }

  if (userId) {
    params.append('userId', userId);
  }

  // Append field filters (UI -> API route handles forwarding to backend)
  if (filters.name) params.append('name', filters.name);
  if (filters.city) params.append('city', filters.city);
  if (filters.state) params.append('state', filters.state);
  if (filters.country) params.append('country', filters.country);
  if (filters.phone) params.append('phone', filters.phone);
  if (filters.email) params.append('email', filters.email);

  const response = await fetch(`/api/clinic?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch clinic data");
  }
  const result = (await response.json()) as ApiResponse<
    PaginatedResponse<Clinic>
  >;
  return result.data;
};

export const useGetClinic = (
  pageNumber = 1,
  pageSize = 10,
  companyId: string | null,
  enabled = true,
  userId?: string | null,
  filters: ClinicFilters = {}
) => {
  return useQuery({
    queryKey: ["clinic", pageNumber, pageSize, companyId, userId, filters],
    queryFn: () => getClinic(pageNumber, pageSize, companyId, userId, filters),
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    enabled,
  });
};
