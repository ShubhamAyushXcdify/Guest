import { useQuery } from "@tanstack/react-query";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash?: string;
  roleId: string;
  roleName?: string;
  clinicId?: string;
  clinicName?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  doctorSlots?: string[];
}

export const getUserById = async (id: string): Promise<User | null> => {
  if (!id) return null;
  
  try {
    const response = await fetch(`/api/user/${id}`);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch user data');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    throw error;
  }
};

export function useGetUserById(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => getUserById(id),
    enabled: !!id,
    retry: 1,
  });
} 