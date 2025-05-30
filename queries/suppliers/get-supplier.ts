import { keepPreviousData, useQuery } from "@tanstack/react-query";

export type Supplier = {
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
    createdAt: string;
    updatedAt: string;
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

const getSupplier = async (pageNumber = 1, pageSize = 10, search = '') => {
    const response = await fetch(`/api/supplier?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`);
    if (!response.ok) {
        throw new Error('Failed to fetch supplier data');
    }
    return response.json() as Promise<PaginatedResponse<Supplier>>;
};

export const useGetSupplier = (pageNumber = 1, pageSize = 10, search = '', enabled = true) => {
    return useQuery({
        queryKey: ["supplier", pageNumber, pageSize, search],
        queryFn: async () => {
            return getSupplier(pageNumber, pageSize, search);
        },
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
        enabled
    });
};