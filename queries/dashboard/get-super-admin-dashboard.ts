import { useQuery } from "@tanstack/react-query";

export interface SuperAdminDashboardParams {
  fromDate?: string;
  toDate?: string;
}

export interface ClinicDetail {
  numberOfVeterinarians: number;
  numberOfPatients: number;
  numberOfClients: number;
  numberOfProducts: number;
  numberOfSuppliers: number;
}

export interface AppointmentCompletionRatios {
  totalAppointments: number;
  completedAppointments: number;
  canceledAppointments: number;
  completionRatio: number;
  percentageOfCompleting: string;
}

export interface Clinic {
  clinicName: string;
  clinicDetails: ClinicDetail;
  appointmentCompletionRatios: AppointmentCompletionRatios;
}

export interface Company {
  companyId: string;
  companyName: string;
  numberOfAdmins: number;
  clinics: Clinic[];
}

export interface SuperAdminDashboardResponse {
  companies: Company[];
}

const getSuperAdminDashboard = async (params: SuperAdminDashboardParams) => {
  const query = new URLSearchParams();
  if (params.fromDate) query.set('fromDate', params.fromDate);
  if (params.toDate) query.set('toDate', params.toDate);
  
  const url = `/api/dashboard/super-admin?${query.toString()}`;

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
  return result as SuperAdminDashboardResponse;
};

export const useGetSuperAdminDashboard = (params: SuperAdminDashboardParams = {}) => {
  return useQuery({
    queryKey: ['super-admin-dashboard', params],
    queryFn: () => getSuperAdminDashboard(params),
  });
};
