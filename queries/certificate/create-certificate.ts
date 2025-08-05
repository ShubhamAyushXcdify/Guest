import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateCertificateParams {
  visitId: string;
  certificateJson: string;
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
      throw new Error(data.message || "Failed to create certificate");
    }

    return data;
  };

  return useMutation({
    mutationFn: createCertificate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["certificate", data.visitId],
      });

      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: options?.onError,
  });
};
