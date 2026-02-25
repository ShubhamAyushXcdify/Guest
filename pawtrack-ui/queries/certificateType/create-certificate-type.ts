import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

interface CreateCertificateTypeParams {
  name: string;
  description: string;
  isActive: boolean;
}

interface CertificateType {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const createCertificateType = async (newCertificateType: CreateCertificateTypeParams): Promise<CertificateType> => {
  const response = await fetch("/api/certificateType", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newCertificateType),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create certificate type");
  }

  return response.json();
};

export const useCreateCertificateType = () => {
  const queryClient = useQueryClient();
  return useMutation<CertificateType, Error, CreateCertificateTypeParams>({ 
    mutationFn: createCertificateType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificateTypes"] });
      toast({
        title: "Success",
        description: "Certificate type created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create certificate type.",
        variant: "destructive",
      });
    },
  });
};


