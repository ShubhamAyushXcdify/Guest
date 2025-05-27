import { keepPreviousData, useQuery } from "@tanstack/react-query";

export interface Patient {
  id: string;
  clinicId: string;
  clientId: string;
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
}

interface GetPatientsResponse {
  data: Patient[];
  totalCount: number;
  pageCount: number;
}

const getPatients = async (pageNumber = 1, pageSize = 10, search = '') => {
  const response = await fetch(
    `/api/patients?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch patients data');
  }
  
  const result = await response.json() as GetPatientsResponse;
  console.log("API response:", result);
  
  // Return the data structure as is, since it's already in the correct format
  return result;
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
