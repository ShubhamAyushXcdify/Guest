import { useMutation, useQueryClient } from "@tanstack/react-query";

const deleteCompany = async (id: string): Promise<void> => {
  const response = await fetch(`/api/companies/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete company');
  }
};

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCompany,
    onSuccess: (_, deletedId) => {
      // Invalidate and refetch companies list
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      // Remove the specific company from cache
      queryClient.removeQueries({ queryKey: ['company', deletedId] });
    },
  });
}