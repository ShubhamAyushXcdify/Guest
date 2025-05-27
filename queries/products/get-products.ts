import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { Product } from "@/components/products";


const getProducts = async (pageNumber = 1, pageSize = 10, search = '') => {
    const response = await fetch(`/api/products?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`);
    if (!response.ok) {
        throw new Error('Failed to fetch product data');
    
    }
    return response.json();
};

export const useGetProducts = (pageNumber = 1, pageSize = 10, search = '', enabled = true) => {
    return useQuery({
        queryKey: ["products", pageNumber, pageSize, search],
        queryFn: async () => {
            const res = await getProducts(pageNumber, pageSize, search)
            return res.data as Product[]
        },
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
        enabled
    });
};
