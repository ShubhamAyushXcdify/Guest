import { keepPreviousData, useQuery } from "@tanstack/react-query";

type Room = {
    id: string;
    name: string;
    clinicId: string;
    capacity: number;
    status: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

const getRoom = async (pageNumber = 1, pageSize = 10, search = '') => {
    const response = await fetch(`/api/room?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`);
    if (!response.ok) {
        throw new Error('Failed to fetch room data');
    }
    return response.json();
};

export const useGetRoom = (pageNumber = 1, pageSize = 10, search = '', enabled = true) => {
    return useQuery({
        queryKey: ["room", pageNumber, pageSize, search],
        queryFn: async () => {
            const res = await getRoom(pageNumber, pageSize, search)
            return res.data as Room[]
        },
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
        enabled
    });
};
