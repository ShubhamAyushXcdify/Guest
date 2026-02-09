import { useQuery } from "@tanstack/react-query";

interface DashboardSummaryParams {
  companyId: string;
  fromDate?: string;
  toDate?: string;
}

const getDashboardSummary = async (params: DashboardSummaryParams) => {
  const query = new URLSearchParams();
  if (params.fromDate) query.set('fromDate', params.fromDate);
  if (params.toDate) query.set('toDate', params.toDate);
  const url = `/api/dashboard/company-admin/${params.companyId}${query.toString() ? `?${query.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const result = await response.json();
  if (!response.ok) {
    throw result;
  }
  return result;
};

export const useGetDashboardSummary = (
  params: DashboardSummaryParams | null,
  options?: { enabled?: boolean }
) => {
  const enabled = (options?.enabled ?? true) && !!params?.companyId;
  return useQuery({
    queryKey: ['dashboard-summary', params],
    queryFn: () => getDashboardSummary(params!),
    enabled,
  });
}; 