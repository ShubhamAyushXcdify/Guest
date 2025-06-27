import { useQuery } from "@tanstack/react-query";

export type AppointmentType = {
    appointmentTypeId: string;
    name: string;
    clinicId: string;
    isActive?: boolean;
}

const getAppointmentTypeById = async (id: string) => {
    const response = await fetch(`/api/appointmentType/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch appointment type data');
    }
    return response.json();
};

export const useGetAppointmentTypeById = (id: string, enabled = true) => {
    return useQuery({
        queryKey: ["appointmentType", id],
        queryFn: async () => {
            const res = await getAppointmentTypeById(id)
            return res as AppointmentType
        },
        refetchOnWindowFocus: false,
        enabled
    });
};
