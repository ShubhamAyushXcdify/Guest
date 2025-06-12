import { keepPreviousData, useQuery } from "@tanstack/react-query";

export interface MedicalRecord {
  id: string;
  clinicId: string;
  patientId: string;
  appointmentId: string;
  veterinarianId: string;
  visitDate: string;
  chiefComplaint: string;
  history: string;
  physicalExamFindings: string;
  diagnosis: string;
  treatmentPlan: string;
  followUpInstructions: string;
  weightKg?: number;
  temperatureCelsius?: number;
  heartRate?: number;
  respiratoryRate?: number;
  createdAt: string;
  updatedAt: string;
  clinic?: {
    id: string;
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

interface GetMedicalRecordsParams {
  pageNumber?: number;
  pageSize?: number;
  clinicId?: string;
  patientId?: string;
  appointmentId?: string;
  veterinarianId?: string;
  dateFrom?: string;
  dateTo?: string;
}

const getMedicalRecords = async ({
  pageNumber = 1,
  pageSize = 10,
  clinicId = '',
  patientId = '',
  appointmentId = '',
  veterinarianId = '',
  dateFrom = '',
  dateTo = ''
}: GetMedicalRecordsParams): Promise<PaginatedResponse<MedicalRecord>> => {
  let url = `/api/MedicalRecord?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  
  if (clinicId) url += `&clinicId=${clinicId}`;
  if (patientId) url += `&patientId=${patientId}`;
  if (appointmentId) url += `&appointmentId=${appointmentId}`;
  if (veterinarianId) url += `&veterinarianId=${veterinarianId}`;
  if (dateFrom) url += `&dateFrom=${dateFrom}`;
  if (dateTo) url += `&dateTo=${dateTo}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch medical records');
  }
  
  return response.json();
};

export const useGetMedicalRecords = (params: GetMedicalRecordsParams = {}, enabled = true) => {
  return useQuery({
    queryKey: ['medicalRecords', params],
    queryFn: () => getMedicalRecords(params),
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    enabled,
  });
}; 