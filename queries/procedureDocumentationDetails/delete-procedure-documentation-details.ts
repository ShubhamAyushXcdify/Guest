import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteProcedureDocumentDetailsParams {
  id: string;
  visitId: string;
  procedureId: string;
}

export const useDeleteProcedureDocumentDetails = () => {
  const queryClient = useQueryClient();

  const deleteProcedureDocumentDetails = async (
    params: DeleteProcedureDocumentDetailsParams
  ): Promise<void> => {
    try {
      const response = await fetch(`/api/procedureDocumentationDetails/${params.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Failed to delete procedure documentation details"
        );
      }
    } catch (error) {
      console.error("Error deleting procedure documentation details:", error);
      throw error;
    }
  };

  return useMutation({
    mutationFn: deleteProcedureDocumentDetails,
    onSuccess: (_, params) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["procedureDocumentationDetails", params.visitId, params.procedureId],
      });
    },
  });
}; 