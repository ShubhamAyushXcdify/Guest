import { keepPreviousData, useQuery } from "@tanstack/react-query";

export interface Patient {
  id: string;
  clinicId: string;
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

const getPatients = async (pageNumber = 1, pageSize = 10, search = '') => {
  const response = await fetch(
    `/api/patients?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch patients data');
  }
  
  return response.json() as Promise<PaginatedResponse<Patient>>;
};

export function useGetPatients(
  pageNumber = 1,
  pageSize = 10,
  search = ''
) {
  return useQuery({
    queryKey: ['patients', pageNumber, pageSize, search],
    queryFn: () => getPatients(pageNumber, pageSize, search),
    placeholderData: keepPreviousData,
  });
}


