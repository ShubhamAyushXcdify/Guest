import { keepPreviousData, useQuery } from "@tanstack/react-query";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: string;
  roleId: string;
  roleName: string;
  clinics?: { clinicId: string; clinicName: string }[];
  clinicIds?: string[]; // Array of clinic IDs as per API
  companyId?: string;
  slots?: string[]; // Array of slot IDs as per API
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface UserResponse {
  items: User[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

const getUsers = async (
  pageNumber = 1,
  pageSize = 10,
  search = '',
  companyId = '',
  clinicIds: string[] = [], // Added clinicIds as an array
  roleIds: string[] = [] // Added roleIds as an array
): Promise<UserResponse> => {
  const queryParams = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
    paginationRequired: 'true',
  });
  
  if (search) queryParams.append('search', search);
  if (companyId) queryParams.append('companyId', companyId);

  clinicIds.forEach(id => {
    queryParams.append('clinicIds', id);
  });
  roleIds.forEach(id => {
    queryParams.append('roleIds', id);
  });
  
  const url = `/api/user?${queryParams.toString()}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch user data');
  }
  const data = await response.json();
  // The API now returns the data directly, not wrapped in a data property
  return data as UserResponse;
};

export const useGetUsers = (pageNumber = 1, pageSize = 10, search = '', enabled = true, companyId = '', clinicIds: string[] = [], roleIds: string[] = []) => {
  return useQuery({
    queryKey: ["users", pageNumber, pageSize, search, companyId, clinicIds, roleIds],
    queryFn: () => getUsers(pageNumber, pageSize, search, companyId, clinicIds, roleIds),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
    enabled
  });
};