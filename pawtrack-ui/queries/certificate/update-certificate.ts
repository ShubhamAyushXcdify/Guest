import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Certificate {
  id?: string;
  certificateTypeId: string;
  certificateJson: string | object;
}

interface UpdateCertificateRequest {
  visitId: string;
  certificates: Array<{
    certificateTypeId: string;
    certificateJson: string | object;
  }>;
}

export const useUpdateCertificate = () => {
  const queryClient = useQueryClient();

  const updateCertificate = async (data: UpdateCertificateRequest) => {
    const response = await fetch(`/api/certificate`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        visitId: data.visitId,
        certificates: data.certificates.map(cert => ({
          certificateTypeId: cert.certificateTypeId,
          certificateJson: typeof cert.certificateJson === 'string' 
            ? cert.certificateJson 
            : JSON.stringify(cert.certificateJson)
        }))
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update certificate');
    }

    return response.json();
  };

  return useMutation({
    mutationFn: updateCertificate,
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["certificates", "visit", variables.visitId],
      });
      // Also invalidate the list query if you have one
      queryClient.invalidateQueries({
        queryKey: ["certificates"],
      });
    },
    onError: (error: Error) => {
      console.error("Error updating certificate:", error);
    },
  });
};
