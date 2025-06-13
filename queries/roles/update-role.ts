import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateRoleData {
  name: string;
  value: string;
  isPrivileged: boolean;
  metadata: string | null;
  isClinicRequired: boolean;
  colourName: string;
}

const updateRole = async ({ id, ...data }: { id: string } & UpdateRoleData) => {
  const response = await fetch(`/api/role/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok && response.status !== 204) {
    throw new Error('Failed to update role');
  }
  return response.status === 204 ? null : response.json();
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
