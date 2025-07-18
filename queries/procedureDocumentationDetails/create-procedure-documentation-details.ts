import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateProcedureDocumentDetailsParams {
  visitId: string;
  procedureId: string;
  documentDetails: string;
}

export const useCreateProcedureDocumentDetails = (
  options?: {
    onSuccess?: (data: any) => void;
    onError?: (error: Error) => void;
  }
) => {
  const queryClient = useQueryClient();

  const createProcedureDocumentDetails = async (
    params: CreateProcedureDocumentDetailsParams
  ): Promise<any> => {
    // Instead of making an API call, log a warning that we should use PUT
    console.warn("CREATE not supported for procedure documentation details, use UPDATE instead");
    console.log("Would have sent data:", params);
    
    // Throw an error to prevent using the POST operation
    throw new Error("Create operation not supported. Please use update operation instead.");
  };

  return useMutation({
    mutationFn: createProcedureDocumentDetails,
    onSuccess: (data) => {
      // This won't be called due to the error, but keeping for reference
      queryClient.invalidateQueries({
        queryKey: ["procedureDocumentationDetails", data.visitId, data.procedureId],
      });
      
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: options?.onError,
  });
}; 