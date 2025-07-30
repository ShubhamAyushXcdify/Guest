import { useQuery } from "@tanstack/react-query";

export interface ProductMapping {
  id: string;
  productId: string;
  dosage: string | null;
  frequency: string;
  numberOfDays: number;
}

export interface PrescriptionDetail {
  id: string;
  visitId: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  productMappings: ProductMapping[];
}

const getPrescriptionDetailById = async (id: string): Promise<PrescriptionDetail> => {
  try {
    if (!id) {
      throw new Error("Prescription detail ID is required");
    }
    
    const response = await fetch(`/api/PrescriptionDetail/${id}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch prescription detail");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching prescription detail by ID:", error);
    throw error;
  }
};

export const useGetPrescriptionDetailById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['prescriptionDetail', id],
    queryFn: () => getPrescriptionDetailById(id),
    enabled: !!id && enabled,
  });
};

export default getPrescriptionDetailById; 