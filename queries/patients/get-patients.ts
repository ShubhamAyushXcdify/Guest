import { keepPreviousData, useQuery } from "@tanstack/react-query";

export interface Patient {
  id: string;
  clientId: string;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhonePrimary: string;
  clientPhoneSecondary: string;
  clientAddressLine1: string;
  clientAddressLine2: string;
  clientCity: string;
  clientState: string;
  clientPostalCode: string;
  clientEmergencyContactName: string;
  clientEmergencyContactPhone: string;
  clientNotes: string;
  name: string;
  species: string;
  breed: string;
  secondaryBreed: string;
  color: string;
  gender: string;
  isNeutered: boolean;
  dateOfBirth: string;
  weightKg: number;
  microchipNumber: string;
  registrationNumber: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  allergies: string;
  medicalConditions: string;
  behavioralNotes: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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

const getPatients = async (pageNumber = 1, pageSize = 10, search = '', clientId = '', companyId?: string) => {
  // If there's a search term, use the search endpoint
  if (search && companyId) {
    const searchParams = new URLSearchParams({
      query: search,
      type: 'name',
      companyId,
      page: pageNumber.toString(),
      pageSize: pageSize.toString()
    });
    
    const response = await fetch(`/api/patients/search?${searchParams.toString()}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to search patients');
    }
    
    const data = await response.json();
    // Transform the search response to match the expected pagination format
    return {
      items: data,
      totalCount: data.length,
      pageNumber,
      pageSize,
      totalPages: Math.ceil(data.length / pageSize),
      hasPreviousPage: pageNumber > 1,
      hasNextPage: data.length >= pageSize
    } as PaginatedResponse<Patient>;
  } 
  // Regular listing without search
  else {
    const params = new URLSearchParams();
    params.append('pageNumber', pageNumber.toString());
    params.append('pageSize', pageSize.toString());
    
    if (clientId) {
      params.append('clientId', clientId);
    }
    
    if (companyId) {
      params.append('companyId', companyId);
    }

    const response = await fetch(`/api/patients?${params.toString()}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch patients data');
    }
    
    return response.json() as Promise<PaginatedResponse<Patient>>;
  }
};

export function useGetPatients(
  pageNumber = 1,
  pageSize = 10,
  search = '',
  clientId = '',
  companyId?: string
) {
  return useQuery({
    queryKey: ['patients', pageNumber, pageSize, search, clientId, companyId],
    queryFn: () => getPatients(pageNumber, pageSize, search, clientId, companyId),
    placeholderData: keepPreviousData,
  });
}


