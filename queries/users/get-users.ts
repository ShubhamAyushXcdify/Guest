import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { User } from "@/components/users";

const getUsers = async (pageNumber = 1, pageSize = 10, search = '') => {
    const response = await fetch(`/api/user?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`);
    if (!response.ok) {
        throw new Error('Failed to fetch user data');
    }
    const data = await response.json();
    return data.data || data; // Handle both response formats
};

export const useGetUsers = (pageNumber = 1, pageSize = 10, search = '', enabled = true) => {
    return useQuery({
        queryKey: ["users", pageNumber, pageSize, search],
        queryFn: async () => {
            const res = await getUsers(pageNumber, pageSize, search);
            return Array.isArray(res) ? res : [];
        },
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
        enabled
    });
};
