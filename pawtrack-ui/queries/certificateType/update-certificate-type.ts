import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

interface UpdateCertificateTypeParams {
  id: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

interface CertificateType {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const updateCertificateType = async (updatedCertificateType: UpdateCertificateTypeParams): Promise<CertificateType> => {
  const { id, ...body } = updatedCertificateType;
  const response = await fetch(`/api/certificateType/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update certificate type");
  }

  return response.json();
};

export const useUpdateCertificateType = () => {
  const queryClient = useQueryClient();
  return useMutation<CertificateType, Error, UpdateCertificateTypeParams>({
    mutationFn: updateCertificateType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificateTypes"] });
      queryClient.invalidateQueries({ queryKey: ["certificateType", { id: "*" }] }); // Invalidate specific type query
      toast({
        title: "Success",
        description: "Certificate type updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update certificate type.",
        variant: "destructive",
      });
    },
  });
};


