import { useQuery } from "@tanstack/react-query";

const getSupplierById = async (id: string) => {
    const response = await fetch(`/api/supplier/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch supplier');
    }
    return response.json();
};

export const useGetSupplierById = (id: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["supplier", id],
        queryFn: () => getSupplierById(id),
        enabled: !!id && enabled,
        refetchOnWindowFocus: false,
    });
};