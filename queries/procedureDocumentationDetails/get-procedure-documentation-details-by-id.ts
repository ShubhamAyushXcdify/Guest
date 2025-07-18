import { useQuery } from "@tanstack/react-query";
import { ProcedureDocumentDetails } from "./get-procedure-documentation-details";

export const useProcedureDocumentDetailsById = (
  id?: string,
  enabled = true
) => {
  const fetchProcedureDocumentDetailsById = async (): Promise<ProcedureDocumentDetails | null> => {
    try {
      if (!id) {
        return null;
      }

      const response = await fetch(`/api/procedureDocumentationDetails/${id}`);

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Failed to fetch procedure documentation details"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching procedure documentation details by ID:", error);
      throw error;
    }
  };

  return useQuery({
    queryKey: ["procedureDocumentationDetails", "id", id],
    queryFn: fetchProcedureDocumentDetailsById,
    enabled: enabled && !!id,
  });
}; 