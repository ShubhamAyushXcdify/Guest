import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface Certificate {
  id?: string;
  certificateTypeId: string;
  certificateJson: string;
}

interface CreateCertificateParams {
  visitId: string;
  certificates: Certificate[];
}

export const useCreateCertificate = (
  options?: {
    onSuccess?: (data: any) => void;
    onError?: (error: Error) => void;
  }
) => {
  const queryClient = useQueryClient();

  const createCertificate = async (
    params: CreateCertificateParams
  ): Promise<any> => {
    const response = await fetch("/api/certificate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create certificates");
    }

    return data;
  };

  return useMutation({
    mutationFn: createCertificate,
    onSuccess: (data) => {
      // Invalidate queries for all created certificates
      if (data.results && Array.isArray(data.results)) {
        data.results.forEach((result: any) => {
          queryClient.invalidateQueries({
            queryKey: ["certificate", result.visitId],
          });
        });
      }

      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      console.error("Error creating certificates:", error);
      if (options?.onError) {
        options.onError(error);
      }
    },
  });
};
