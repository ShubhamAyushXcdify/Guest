import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

interface DeleteCertificateTypeParams {
  id: string;
}

const deleteCertificateType = async (id: string): Promise<void> => {
  const response = await fetch(`/api/certificateType/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete certificate type");
  }
};

export const useDeleteCertificateType = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteCertificateType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificateTypes"] });
      toast({
        title: "Success",
        description: "Certificate type deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete certificate type.",
        variant: "destructive",
      });
    },
  });
};


