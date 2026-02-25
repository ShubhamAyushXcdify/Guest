import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface UpdateVaccinationJsonRequest {
  visitId: string;
  vaccinationMasterId: string;
  vaccinationJson: string;
}

// The response type can be generic or adjusted as needed
export interface UpdateVaccinationJsonResponse {
  success: boolean;
  message?: string;
}

const updateVaccinationJson = async (data: UpdateVaccinationJsonRequest): Promise<UpdateVaccinationJsonResponse> => {
  const response = await fetch("/api/vaccinationDetail/batch", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update vaccination JSON");
  }

  return await response.json();
};

export const useUpdateVaccinationJson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateVaccinationJson,
    onSuccess: () => {
      // Invalidate relevant queries if needed
      queryClient.invalidateQueries({ queryKey: ["vaccinationDetails"] });
    },
    onError: (error) => {
      console.error("Error updating vaccination JSON:", error);
    },
  });
};
