import { useQuery } from "@tanstack/react-query";
import { getMessageFromErrorBody } from "@/utils/apiErrorHandler";

interface DashboardSummaryParams {
  companyId: string;
  fromDate?: string;
  toDate?: string;
  /** When true, backend should return all-time counts for vets/patients (not filtered by fromDate/toDate). */
  useAllTimeCountsForClinicDetails?: boolean;
}

const getDashboardSummary = async (params: DashboardSummaryParams) => {
  const query = new URLSearchParams();
  if (params.fromDate) query.set('fromDate', params.fromDate);
  if (params.toDate) query.set('toDate', params.toDate);
  if (params.useAllTimeCountsForClinicDetails === true) query.set('useAllTimeCountsForClinicDetails', 'true');
  const url = `/api/dashboard/company-admin/${params.companyId}${query.toString() ? `?${query.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = getMessageFromErrorBody(result, 'Failed to load dashboard summary');
    throw new Error(message);
  }
  return result;
};

export const useGetDashboardSummary = (
  params: DashboardSummaryParams | null,
  options?: { enabled?: boolean; queryKeySuffix?: string }
) => {
  const enabled = (options?.enabled ?? true) && !!params?.companyId;
  const queryKey = options?.queryKeySuffix 
    ? ['dashboard-summary', options.queryKeySuffix, params]
    : ['dashboard-summary', params];
  return useQuery({
    queryKey,
    queryFn: () => getDashboardSummary(params!),
    enabled,
  });
}; 