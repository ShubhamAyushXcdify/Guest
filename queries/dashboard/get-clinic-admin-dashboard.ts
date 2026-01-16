import { UseQueryResult, useQuery } from "@tanstack/react-query";

export interface ClinicAdminDashboardParams {
  clinicId: string;
  fromDate?: string;
  toDate?: string;
}

export interface ClinicDetail {
  clinicName: string;
  numberOfVeterinarians: number;
  numberOfPatients: number;
  numberOfClients: number;
  numberOfProducts: number;
  numberOfSuppliers: number;
}

export interface AppointmentCompletionRatios {
  totalAppointments: number;
  scheduledAppointments: number;
  canceledAppointments: number;
  completedAppointments: number;
  completionRatio: number;
  percentageOfCompleting: string;
}

// "appointmentCompletionRatios": {
//         "totalAppointments": 12,
//         "completedAppointments": 2,
//         "canceledAppointments": 6,
//         "completionRatio": 0.16666666666666666,
//         "percentageOfCompleting": "16.67%"
//     },

export interface ClinicAdminDashboardResponse {
  clinicId: string;
  clinicName: string;
  clinicDetail: ClinicDetail;
  appointmentCompletionRatios: AppointmentCompletionRatios;
  fromDate?: string;
  toDate?: string;
  averageRating: number | null;
  serviceProfit: number;
  productProfit: number;
}

const getClinicAdminDashboard = async (params: ClinicAdminDashboardParams) => {
  const query = new URLSearchParams();
  query.set('clinicId', params.clinicId);
  if (params.fromDate) query.set('fromDate', params.fromDate);
  if (params.toDate) query.set('toDate', params.toDate);

  const url = `/api/dashboard/clinic-admin?${query.toString()}`;

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
  return result as ClinicAdminDashboardResponse;
};

// export const useGetClinicAdminDashboard = (params: ClinicAdminDashboardParams) => {
//   return useQuery({
//     queryKey: ['clinic-admin-dashboard', params],
//     queryFn: () => getClinicAdminDashboard(params),
//   });
// }; 

export const useGetClinicAdminDashboard = (
  params: ClinicAdminDashboardParams,
  options?: any
): UseQueryResult<ClinicAdminDashboardResponse> => {

  return useQuery<ClinicAdminDashboardResponse>({
    queryKey: ['clinic-admin-dashboard', params],
    queryFn: () => getClinicAdminDashboard(params),
    enabled: options?.enabled ?? true,
    ...options,
  });
};

