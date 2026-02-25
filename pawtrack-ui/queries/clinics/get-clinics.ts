import { useQuery } from "@tanstack/react-query";

export interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  email: string;
  isActive: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Function to fetch clinics from the API
const getClinics = async (search = '') => {
  const response = await fetch(
    `/api/clinics${search ? `?search=${encodeURIComponent(search)}` : ''}`
  );
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch clinics data');
  }
  
  const data = await response.json();
  return data as PaginatedResponse<Clinic>;
};

// React Query hook to fetch clinics
export function useGetClinics(search = '') {
  return useQuery({
    queryKey: ['clinics', search],
    queryFn: () => getClinics(search),
    retry: 1,
    staleTime: 60000, // 1 minute
  });
}

// Sample clinics for development/testing
export const SAMPLE_CLINICS = [
  {
    id: "69c3c549-590b-47e3-8581-967b6fc14753",
    name: "PawTrack Animal Hospital",
    address: "123 Main Street",
    city: "Springfield",
    state: "IL",
    postalCode: "62704",
    phone: "+1-555-123-4567",
    email: "info@pawtrack.example.com",
    isActive: true
  },
  {
    id: "9b2edb88-5758-4c9d-a641-8a51534f723a",
    name: "Furry Friends Veterinary Clinic",
    address: "456 Oak Avenue",
    city: "Springfield",
    state: "IL",
    postalCode: "62704",
    phone: "+1-555-987-6543",
    email: "info@furryfriends.example.com",
    isActive: true
  },
  {
    id: "c4f8a7d6-3e29-45b1-9c2d-7a56f8e32b10",
    name: "Happy Paws Pet Care",
    address: "789 Pine Road",
    city: "Springfield", 
    state: "IL",
    postalCode: "62704",
    phone: "+1-555-456-7890",
    email: "care@happypaws.example.com",
    isActive: true
  }
]; 