import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { User } from "@/components/users";

const getUsers = async (pageNumber = 1, pageSize = 10, search = '') => {
    const response = await fetch(`/api/user?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`);
    if (!response.ok) {
        throw new Error('Failed to fetch user data');
    }
    return response.json();
};

export const useGetUsers = (pageNumber = 1, pageSize = 10, search = '', enabled = true) => {
    return useQuery({
        queryKey: ["users", pageNumber, pageSize, search],
        queryFn: async () => {
            const res = await getUsers(pageNumber, pageSize, search);
            return res.data as User[];
        },
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
        enabled
    });
};
