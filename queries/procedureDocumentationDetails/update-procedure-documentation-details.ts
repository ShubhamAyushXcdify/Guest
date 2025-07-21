import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProcedureDocumentDetails } from "./get-procedure-documentation-details";

interface UpdateProcedureDocumentDetailsRequest {
  id: string;
  documentDetails: string;
}

interface ErrorResponse {
  message?: string;
  [key: string]: any;
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

      const responseText = await response.text();
      
      if (!response.ok) {
        let errorData: ErrorResponse = {};
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          // Parsing error, continue with default error message
        }
        
        throw new Error(
          errorData.message || `Failed to update procedure documentation details: ${response.status}`
        );
      }

      return JSON.parse(responseText);
    } catch (error) {
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
    onError: (error) => {
      // Handle error silently
    }
  });
}; 