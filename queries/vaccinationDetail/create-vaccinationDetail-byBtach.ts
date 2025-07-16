// This file is now deprecated. Please use create-vaccinationDetail.ts instead.
// It is kept for backward compatibility.

import { 
  useCreateVaccinationDetail, 
  type VaccinationDetailRequest, 
  type VaccinationDetailItem,
  type VaccinationDetailResponse 
} from './create-vaccinationDetail';

// Re-export the interfaces and hook
export type { 
  VaccinationDetailRequest, 
  VaccinationDetailItem,
  VaccinationDetailResponse 
};

// Export the hook with the old name for backward compatibility
export const useCreateVaccinationDetailByBatch = useCreateVaccinationDetail;
