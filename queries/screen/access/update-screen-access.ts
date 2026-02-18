import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getMessageFromErrorBody } from "@/utils/apiErrorHandler";

export interface UpdateScreenAccessPayload {
  roleId: string;
  clinicId: string;
  screenIds: string[];
  isAccessEnable: boolean;
}

const updateScreenAccess = async (payload: UpdateScreenAccessPayload) => {
  const response = await fetch(`/api/screen/access`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = getMessageFromErrorBody(result, "Failed to update screen access");
    throw new Error(message);
  }
  return result;
};

export const useUpdateScreenAccess = ({ onSuccess, onError }: { onSuccess?: () => void; onError?: (e: any) => void }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateScreenAccess,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["screen-access"] });
      onSuccess?.();
    },
    onError: (e) => onError?.(e),
  });
};


