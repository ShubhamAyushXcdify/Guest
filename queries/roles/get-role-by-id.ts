import { useQuery } from "@tanstack/react-query";

const getRoleById = async (id: string) => {
    const response = await fetch(`/api/role/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch role');
    }
    return response.json();
};

export const useGetRoleById = (id: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["role", id],
        queryFn: () => getRoleById(id),
        enabled: !!id && enabled,
        refetchOnWindowFocus: false,
    });
};
