import { keepPreviousData, useQuery } from "@tanstack/react-query";

export type AppointmentType = {
    appointmentTypeId: string;
    name: string;
    isActive: boolean;
}

const getAppointmentType = async (pageNumber = 1, pageSize = 10, search = '') => {
    let url = `/api/appointmentType?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch appointment type data');
    }
    return response.json();
};

export const useGetAppointmentType = (pageNumber = 1, pageSize = 10, search = '', enabled = true) => {
    return useQuery({
        queryKey: ["appointmentType", pageNumber, pageSize, search],
        queryFn: async () => {
            const res = await getAppointmentType(pageNumber, pageSize, search);
            return res.data; // This returns the array directly
        },
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
        enabled
    });
};
