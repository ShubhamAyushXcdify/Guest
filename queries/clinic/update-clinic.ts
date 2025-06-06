import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateClinicData {
  id: string;
  [key: string]: any;
}

const updateClinic = async (data: UpdateClinicData) => {
  const response = await fetch(`/api/clinic`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok && response.status !== 204) {
    throw new Error('Failed to update clinic');
  }
  return response.status === 204 ? null : response.json();
};

export const useUpdateClinic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateClinic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic"] });
    },
  });
};
