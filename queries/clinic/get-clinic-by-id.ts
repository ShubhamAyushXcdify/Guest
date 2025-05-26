import { useQuery } from "@tanstack/react-query";

const getClinicById = async (id: string) => {
    const response = await fetch(`/api/clinic/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch clinic');
    }
    return response.json();
};

export const useGetClinicById = (id: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["clinic", id],
        queryFn: () => getClinicById(id),
        enabled: !!id && enabled,
        refetchOnWindowFocus: false,
    });
};
