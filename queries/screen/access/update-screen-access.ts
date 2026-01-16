import { useMutation, useQueryClient } from "@tanstack/react-query";

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
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw err ?? new Error("Failed to update screen access");
  }
  return await response.json().catch(() => ({}));
};

export const useUpdateScreenAccess = ({ onSuccess, onError }: { onSuccess?: () => void; onError?: (e: any) => void }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateScreenAccess,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["screen-access"] });
      onSuccess?.();
    },
    onError: (e) => onError?.(e),
  });
};


