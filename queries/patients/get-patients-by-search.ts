import { useQuery } from '@tanstack/react-query';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  medicalRecordId?: string;
  patientId?: string;
  species?: string;
  breed?: string;
  age?: number;
  gender?: string;
  client?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phoneNumber?: string;
  }
}

const searchPatients = async (query: string, searchType: string): Promise<Patient[]> => {
  try {
    if (!query) {
      return [];
    }

    const searchParams = new URLSearchParams({
      query,
      type: searchType || ''
    });

    const response = await fetch(`/api/patients/search?${searchParams.toString()}`);

    if (!response.ok) {
      throw new Error('Failed to search patients');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching patients:', error);
    throw error;
  }
};

export function useSearchPatients(query: string, searchType: string = '') {
  return useQuery({
    queryKey: ['patients', 'search', query, searchType],
    queryFn: () => searchPatients(query, searchType),
    enabled: !!query, // Only run the query if there's a search term
  });
}
