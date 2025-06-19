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

async function getProviderStats(): Promise<ProviderStats[]> {
  const response = await fetch("/api/providers/stats", {
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

export function useGetProviderStats() {
  return useQuery({
    queryKey: ["providerStats"],
    queryFn: getProviderStats,
  });
} 