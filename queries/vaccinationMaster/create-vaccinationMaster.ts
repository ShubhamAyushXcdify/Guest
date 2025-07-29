import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateVaccinationMasterData, VaccinationMaster } from "./types";

const createVaccinationMaster = async (data: CreateVaccinationMasterData): Promise<VaccinationMaster> => {
    try {
        const response = await fetch('/api/vaccinationMaster', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to create vaccination master');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error creating vaccination master:', error);
        throw error;
    }
};

export const useCreateVaccinationMaster = ({
    onSuccess,
    onError,
}: {
    onSuccess?: (data: VaccinationMaster) => void;
    onError?: (error: any) => void;
} = {}) => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: createVaccinationMaster,
        onSuccess: (data) => {
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['vaccinationMasters'] });
            if (onSuccess) onSuccess(data);
        },
        onError: (error) => {
            if (onError) onError(error);
        },
    });
};
