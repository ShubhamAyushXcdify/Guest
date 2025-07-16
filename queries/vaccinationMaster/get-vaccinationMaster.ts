import { useQuery } from "@tanstack/react-query";
import { VaccinationMaster } from "./types";

interface GetVaccinationMastersParams {
    species?: string;
    isCore?: boolean;
}

const getVaccinationMasters = async (params: GetVaccinationMastersParams = {}): Promise<VaccinationMaster[]> => {
    try {
        const queryParams = new URLSearchParams();
        
        if (params.species) {
            queryParams.append('species', params.species);
        }
        
        if (params.isCore !== undefined) {
            queryParams.append('isCore', params.isCore.toString());
        }
        
        const queryString = queryParams.toString();
        const url = `/api/vaccinationMaster${queryString ? `?${queryString}` : ''}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch vaccination masters');
        }
        
        return await response.json();
    } catch (error) {
        console.error("Error fetching vaccination masters:", error);
        throw error;
    }
};

export const useGetVaccinationMasters = (params: GetVaccinationMastersParams = {}) => {
    return useQuery<VaccinationMaster[], Error>({
        queryKey: ['vaccinationMasters', params],
        queryFn: () => getVaccinationMasters(params),
    });
};
