import { UseQueryResult, useQuery } from "@tanstack/react-query";

export interface ClinicWeeklyProfitParams {
  clinicId: string;
  fromDate?: string;
  toDate?: string;
}

export interface WeeklyProfitItem {
  weekLabel: string;
  monthYear: string;
  startDate: string;
  endDate: string;
  serviceProfit: number;
  productProfit: number;
}

export interface ClinicWeeklyProfitResponse {
  clinicId: string;
  clinicName: string;
  weeklyData: WeeklyProfitItem[];
}

const getClinicWeeklyProfit = async (params: ClinicWeeklyProfitParams) => {
  const query = new URLSearchParams();
  query.set("clinicId", params.clinicId);
  if (params.fromDate) query.set("fromDate", params.fromDate);
  if (params.toDate) query.set("toDate", params.toDate);

  const url = `/api/dashboard/clinic-weekly-profit?${query.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const result = await response.json();
  if (!response.ok) {
    throw result;
  }
  return result as ClinicWeeklyProfitResponse;
};

export const useGetClinicWeeklyProfit = (
  params: ClinicWeeklyProfitParams,
  options?: any
): UseQueryResult<ClinicWeeklyProfitResponse> => {
  return useQuery<ClinicWeeklyProfitResponse>({
    queryKey: ["clinic-weekly-profit", params],
    queryFn: () => getClinicWeeklyProfit(params),
    enabled: !!params?.clinicId && (options?.enabled ?? true),
    ...options,
  });
};