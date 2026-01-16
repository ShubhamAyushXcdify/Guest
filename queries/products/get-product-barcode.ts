import { useQuery } from '@tanstack/react-query';

interface BarcodeData {
  Sku: string;
  ProductName: string;
  Category: string;
}

const fetchProductBarcode = async (productId: string): Promise<BarcodeData> => {
  const response = await fetch(`/api/products/${productId}/barcode`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch barcode data');
  }

  return response.json();
};

export const useGetProductBarcode = (productId: string) => {
  return useQuery({
    queryKey: ['product-barcode', productId],
    queryFn: () => fetchProductBarcode(productId),
    enabled: !!productId,
  });
}; 