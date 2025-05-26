import { keepPreviousData, useQuery } from "@tanstack/react-query";

type Clinic = {
    id: string;
    name: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    email: string;
    website: string;
    taxId: string;
    licenseNumber: string;
    subscriptionStatus: string;
    subscriptionExpiresAt: string;
    createdAt: string;
    updatedAt: string;
}

const getClinic = async (pageNumber = 1, pageSize = 10, search = '') => {
    const response = await fetch(`/api/clinic?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`);
    if (!response.ok) {
        throw new Error('Failed to fetch clinic data');
    }
    return response.json();
};

export const useGetClinic = (pageNumber = 1, pageSize = 10, search = '', enabled = true) => {
    return useQuery({
        queryKey: ["clinic", pageNumber, pageSize, search],
        queryFn: async () => {
            const res = await getClinic(pageNumber, pageSize, search)
            return res.data as Clinic[]
        },
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
        enabled
    });
};
