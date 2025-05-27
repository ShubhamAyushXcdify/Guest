import { Room } from "@/components/rooms";
import { useQuery } from "@tanstack/react-query";


const getRoomByClinicId = async (clinicId: string) => {
    const response = await fetch(`/api/room/clinic/${clinicId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch room data');
    }
    return response.json();
};

export const useGetRoomByClinicId = (clinicId: string, enabled = true) => {
    return useQuery({
        queryKey: ["room", "clinic", clinicId],
        queryFn: async () => {
            const res = await getRoomByClinicId(clinicId)
            return res as Room[]
        },
        refetchOnWindowFocus: false,
        enabled
    });
};
