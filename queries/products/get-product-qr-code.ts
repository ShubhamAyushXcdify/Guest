import { useQuery } from '@tanstack/react-query';

interface QrCodeData {
  ProductId: string;
  ProductNumber: string;
  Name: string;
  Category: string;
  ProductType: string;
  Price: number;
  RequiresPrescription: boolean;
  Timestamp: string;
}

const fetchProductQrCode = async (productId: string): Promise<QrCodeData> => {
  const response = await fetch(`/api/products/${productId}/qr-code`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch QR code data');
  }

  return response.json();
};

export const useGetProductQrCode = (productId: string) => {
  return useQuery({
    queryKey: ['product-qr-code', productId],
    queryFn: () => fetchProductQrCode(productId),
    enabled: !!productId,
  });
}; 