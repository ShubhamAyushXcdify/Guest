import { useQuery } from "@tanstack/react-query";

export type AppointmentType = {
    appointmentTypeId: string;
    name: string;
    clinicId: string;
    isActive: boolean;
}

const getAppointmentTypeByClinicId = async (clinicId: string) => {
    const response = await fetch(`/api/appointmentType/clinic/${clinicId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch appointment types for clinic');
    }
    return response.json();
};

export const useGetAppointmentTypeByClinicId = (clinicId: string, enabled = true) => {
    return useQuery({
        queryKey: ["appointmentTypeByClinic", clinicId],
        queryFn: async () => {
            const res = await getAppointmentTypeByClinicId(clinicId);
            return res as AppointmentType[];
        },
        refetchOnWindowFocus: false,
        enabled
    });
}; 