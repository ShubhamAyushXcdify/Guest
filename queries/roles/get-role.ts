import { keepPreviousData, useQuery } from "@tanstack/react-query";

export type Role = {
    id: string;
    name: string;
    value: string;
    isPrivileged: boolean;
    metadata: string;
    createdAt: string;
    updatedAt: string;
    isClinicalRequired: boolean;
};

const getRole = async (pageNumber = 1, pageSize = 10, search = '') => {
    const response = await fetch(`/api/role?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`);
    if (!response.ok) {
        throw new Error('Failed to fetch role data');
    }
    const result = await response.json();
    return result;
};

export const useGetRole = (pageNumber = 1, pageSize = 10, search = '', enabled = true) => {
    return useQuery({
        queryKey: ["role", pageNumber, pageSize, search],
        queryFn: async () => {
            return getRole(pageNumber, pageSize, search);
        },
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
        enabled
    });
};
