import { useQuery } from "@tanstack/react-query";
import { VaccinationMaster } from "./types";

const getVaccinationMasterById = async (id: string): Promise<VaccinationMaster> => {
    try {
        if (!id) {
            throw new Error("Vaccination master ID is required");
        }
        
        const response = await fetch(`/api/vaccinationMaster/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to fetch vaccination master with ID ${id}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Error fetching vaccination master with ID ${id}:`, error);
        throw error;
    }
};

export const useGetVaccinationMasterById = (id: string) => {
    return useQuery<VaccinationMaster, Error>({
        queryKey: ['vaccinationMaster', id],
        queryFn: () => getVaccinationMasterById(id),
        enabled: !!id, // Only run the query if an ID is provided
    });
};
