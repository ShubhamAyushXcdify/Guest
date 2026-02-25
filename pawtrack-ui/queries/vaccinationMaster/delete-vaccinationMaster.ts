import { useMutation, useQueryClient } from "@tanstack/react-query";

const deleteVaccinationMaster = async (id: string): Promise<void> => {
    try {
        if (!id) {
            throw new Error("Vaccination master ID is required");
        }
        
        const response = await fetch(`/api/vaccinationMaster/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to delete vaccination master');
        }
    } catch (error) {
        console.error('Error deleting vaccination master:', error);
        throw error;
    }
};

export const useDeleteVaccinationMaster = ({
    onSuccess,
    onError,
}: {
    onSuccess?: () => void;
    onError?: (error: any) => void;
} = {}) => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: deleteVaccinationMaster,
        onSuccess: (_, id) => {
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['vaccinationMasters'] });
            queryClient.invalidateQueries({ queryKey: ['vaccinationMaster', id] });
            if (onSuccess) onSuccess();
        },
        onError: (error) => {
            if (onError) onError(error);
        },
    });
};
