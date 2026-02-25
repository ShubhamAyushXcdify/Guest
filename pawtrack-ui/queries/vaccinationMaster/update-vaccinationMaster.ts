import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateVaccinationMasterData, VaccinationMaster } from "./types";

const updateVaccinationMaster = async (data: UpdateVaccinationMasterData): Promise<VaccinationMaster> => {
    try {
        const { id, ...updateData } = data;
        
        if (!id) {
            throw new Error("Vaccination master ID is required");
        }
        
        const response = await fetch(`/api/vaccinationMaster/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to update vaccination master');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error updating vaccination master:', error);
        throw error;
    }
};

export const useUpdateVaccinationMaster = ({
    onSuccess,
    onError,
}: {
    onSuccess?: (data: VaccinationMaster) => void;
    onError?: (error: any) => void;
} = {}) => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: updateVaccinationMaster,
        onSuccess: (data, variables) => {
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['vaccinationMasters'] });
            queryClient.invalidateQueries({ queryKey: ['vaccinationMaster', variables.id] });
            if (onSuccess) onSuccess(data);
        },
        onError: (error) => {
            if (onError) onError(error);
        },
    });
};
