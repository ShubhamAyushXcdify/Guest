import { useQuery } from "@tanstack/react-query";

export interface ProviderStats {
  id: string;
  name: string;
  role: string;
  specialty: string;
  avatarUrl?: string | null;
  total: number;
  done: number;
  pending: number;
  appointments: any[]; // or a more specific type if you have one
}

interface GetProviderStatsParams {
  fromDate?: string;
  toDate?: string;
  clinicId?: string;
}

async function getProviderStats(params: GetProviderStatsParams = {}): Promise<ProviderStats[]> {
  // Build query string with parameters
  const queryParams = new URLSearchParams();
  if (params.fromDate) queryParams.append('fromDate', params.fromDate);
  if (params.toDate) queryParams.append('toDate', params.toDate);
  if (params.clinicId) queryParams.append('clinicId', params.clinicId);
  
  // Construct the URL with query parameters
  const url = `/api/providers/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch provider statistics");
  }
  
  const data = await response.json();
  return data.data || [];
}

export function useGetProviderStats(params: GetProviderStatsParams = {}) {
  const queryKey = ['providerStats', params.fromDate, params.toDate, params.clinicId];
  
  return useQuery({
    queryKey,
    queryFn: () => getProviderStats(params),
  });
} 