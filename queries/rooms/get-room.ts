import { keepPreviousData, useQuery } from "@tanstack/react-query";

export type Room = {
    id: string;
    clinicId: string;
    name: string;
    roomType: string;
    isActive: boolean;
    createdAt: string;
}

interface RoomResponse {
    items: Room[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
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
            return res.data as RoomResponse
        },
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
        enabled
    });
};
