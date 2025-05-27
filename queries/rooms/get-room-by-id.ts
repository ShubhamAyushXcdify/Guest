import { useQuery } from "@tanstack/react-query";

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

const getRoomById = async (id: string) => {
    const response = await fetch(`/api/room/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch room data');
    }
    return response.json();
};

export const useGetRoomById = (id: string, enabled = true) => {
    return useQuery({
        queryKey: ["room", id],
        queryFn: async () => {
            const res = await getRoomById(id)
            return res as Room
        },
        refetchOnWindowFocus: false,
        enabled
    });
};
