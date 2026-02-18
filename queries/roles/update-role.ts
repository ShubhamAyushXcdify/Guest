import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getMessageFromErrorBody } from "@/utils/apiErrorHandler";

interface UpdateRoleData {
  name: string;
  value: string;
  isPrivileged: boolean;
  metadata: string | null;
  isClinicRequired: boolean;
  colourName: string;
  priority: number;
}

const updateRole = async ({ id, ...data }: { id: string } & UpdateRoleData) => {
  const response = await fetch(`/api/role/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok && response.status !== 204) {
    const result = await response.json().catch(() => ({}));
    const message = getMessageFromErrorBody(result, 'Failed to update role');
    throw new Error(message);
  }
  return response.status === 204 ? null : response.json();
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateRole,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
