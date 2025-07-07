import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { Product } from "@/components/products";
import { ProductSearchParamsType, proudctSearchParser } from "@/components/products/hooks/useFilter";

export interface PaginatedResponse<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

const getProducts = async (pageNumber = 1, pageSize = 10, search: string) => {

    const response = await fetch(`/api/products${search ? `${search}&` : '?'}pageNumber=${pageNumber}&pageSize=${pageSize}`);
    if (!response.ok) {
        throw new Error('Failed to fetch product data');
    }
    return response.json() as Promise<PaginatedResponse<Product>>;
};

export const useGetProducts = (pageNumber = 1, pageSize = 10, search: ProductSearchParamsType, enabled = true) => { 
    return useQuery({
        queryKey: ["products", pageNumber, pageSize, search],
        queryFn: async () => {
            const searchParams = proudctSearchParser({...search});
            return getProducts(pageNumber, pageSize, searchParams);
        },
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
        enabled
    });
};
