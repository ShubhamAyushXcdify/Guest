import { keepPreviousData, useQuery } from "@tanstack/react-query";

type Supplier = {
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

const getSupplier = async (pageNumber = 1, pageSize = 10, search = '') => {
    const response = await fetch(`/api/supplier?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`);
    if (!response.ok) {
        throw new Error('Failed to fetch supplier data');
    }
    return response.json();
};

export const useGetSupplier = (pageNumber = 1, pageSize = 10, search = '', enabled = true) => {
    return useQuery({
        queryKey: ["supplier", pageNumber, pageSize, search],
        queryFn: async () => {
            const res = await getSupplier(pageNumber, pageSize, search)
            return res.data as Supplier[]
        },
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
        enabled
    });
};