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

const getUsers = async (pageNumber = 1, pageSize = 10, search = ''): Promise<UserResponse> => {
  const response = await fetch(`/api/user?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch user data');
  }
  const data = await response.json();
  // The API now returns the data directly, not wrapped in a data property
  return data as UserResponse;
};

export const useGetUsers = (pageNumber = 1, pageSize = 10, search = '', enabled = true) => {
  return useQuery({
    queryKey: ["users", pageNumber, pageSize, search],
    queryFn: () => getUsers(pageNumber, pageSize, search),
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    enabled
  });
};