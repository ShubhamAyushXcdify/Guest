// queries/certificates/update-certificate.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateCertificateRequest {
  id: string; 
  visitId: string;
  certificateJson: string;
}

interface Certificate {
  id: string;
  visitId: string;
  certificateJson: string;
}

interface ErrorResponse {
  message?: string;
  [key: string]: any;
}

export const useUpdateCertificate = () => {
  const queryClient = useQueryClient();

  const updateCertificate = async (
    data: UpdateCertificateRequest
  ): Promise<Certificate> => {
    const response = await fetch(`/api/certificate/${data.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        visitId: data.visitId,
        certificateJson: data.certificateJson,
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorData: ErrorResponse = {};
      try {
        errorData = JSON.parse(responseText);
      } catch (_) {}
      throw new Error(
        errorData.message || `Failed to update certificate: ${response.status}`
      );
    }

    return JSON.parse(responseText);
  };

  return useMutation({
    mutationFn: updateCertificate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["certificate", "visit", data.visitId],
      });
    },
    onError: (error) => {
      console.error("Error updating certificate:", error);
    },
  });
};
