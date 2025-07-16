import { keepPreviousData, useQuery } from "@tanstack/react-query";

export type Clinic = {
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
    subscriptionExpiresAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    location: {
        lat: number;
        lng: number;
        address: string;
    };
    distance: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export interface ApiResponse<T> {
    data: T;
}

const getClinic = async (pageNumber = 1, pageSize = 10, search = '', latitude: number | null, longitude: number | null) => {
    const response = await fetch(`/api/clinic?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}?lat=${latitude}&lng=${longitude}`);
    if (!response.ok) {
        throw new Error('Failed to fetch clinic data');
    }
    const result = await response.json() as ApiResponse<PaginatedResponse<Clinic>>;
    return result.data;
};

export const useGetClinic = (pageNumber = 1, pageSize = 10, search = '', latitude: number | null, longitude: number | null, enabled = true) => {
    return useQuery({
        queryKey: ["clinic", pageNumber, pageSize, search],
        queryFn: async () => {
            return getClinic(pageNumber, pageSize, search, latitude, longitude);
        },
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
        enabled
    });
};
