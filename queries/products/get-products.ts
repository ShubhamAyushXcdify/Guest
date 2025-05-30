import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { Product } from "@/components/products";

export interface PaginatedResponse<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

const getProducts = async (pageNumber = 1, pageSize = 10, search = '') => {
    const response = await fetch(`/api/products?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`);
    if (!response.ok) {
        throw new Error('Failed to fetch product data');
    }
    return response.json() as Promise<PaginatedResponse<Product>>;
};

export const useGetProducts = (pageNumber = 1, pageSize = 10, search = '', enabled = true) => {
    return useQuery({
        queryKey: ["products", pageNumber, pageSize, search],
        queryFn: async () => {
            return getProducts(pageNumber, pageSize, search);
        },
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
        enabled
    });
};
