import { useQuery } from "@tanstack/react-query";
import { Client } from "./get-client";



const getClientsByClinicId = async (clinicId: string) => {
    const response = await fetch(`/api/clients/clinic/${clinicId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch Clients data');
    }
    return response.json();
};

export const useClientsByClinicId = (clinicId: string, enabled = true) => {
    return useQuery({
        queryKey: ["client", "clinic", clinicId],
        queryFn: async () => {
            const res = await getClientsByClinicId(clinicId)
            return res as Client[]
        },
        refetchOnWindowFocus: false,
        enabled
    });
};
