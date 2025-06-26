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

const getRoomsByClinicId = async (clinicId: string) => {
    const response = await fetch(`/api/room/clinic/${clinicId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch rooms data');
    }
    return response.json();
};

export const useGetRoomsByClinicId = (clinicId: string, enabled = true) => {
    return useQuery({
        queryKey: ["rooms", "clinic", clinicId],
        queryFn: async () => {
            const res = await getRoomsByClinicId(clinicId)
            return res as Room[]
        },
        refetchOnWindowFocus: false,
        enabled
    });
};
