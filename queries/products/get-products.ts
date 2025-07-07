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

export interface ProductFilters {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    category?: string;
    productType?: string;
    dosageForm?: string;
    unitOfMeasure?: string;
    requiresPrescription?: boolean;
    controlledSubstanceSchedule?: string;
    isActive?: boolean;
    minPrice?: number;
    maxPrice?: number;
    lowStock?: boolean;
    createdFrom?: string;
    createdTo?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

const buildQueryString = (filters: ProductFilters): string => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            if (typeof value === 'boolean') {
                params.append(key, value.toString());
            } else if (value instanceof Date) {
                params.append(key, value.toISOString());
            } else {
                params.append(key, value.toString());
            }
        }
    });
    
    return params.toString();
};

const getProducts = async (filters: ProductFilters = {}) => {
    const queryString = buildQueryString(filters);
    const response = await fetch(`/api/products?${queryString}`);
    if (!response.ok) {
        throw new Error('Failed to fetch product data');
    }
    return response.json() as Promise<PaginatedResponse<Product>>;
};

export const useGetProducts = (filters: ProductFilters = {}, enabled = true) => {
    return useQuery({
        queryKey: ["products", filters],
        queryFn: async () => {
            return getProducts(filters);
        },
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
        enabled
    });
};
