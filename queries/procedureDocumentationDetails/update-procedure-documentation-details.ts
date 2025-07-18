import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProcedureDocumentDetails } from "./get-procedure-documentation-details";

interface UpdateProcedureDocumentDetailsRequest {
  id: string;
  documentDetails: string;
}

export const useUpdateProcedureDocumentDetails = () => {
  const queryClient = useQueryClient();

  const updateProcedureDocumentDetails = async (
    data: UpdateProcedureDocumentDetailsRequest
  ): Promise<ProcedureDocumentDetails> => {
    try {
      const response = await fetch(`/api/procedureDocumentationDetails/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Failed to update procedure documentation details"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating procedure documentation details:", error);
      throw error;
    }
  };

  return useMutation({
    mutationFn: updateProcedureDocumentDetails,
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["procedureDocumentationDetails", data.visitId, data.procedureId],
      });
    },
  });
}; 