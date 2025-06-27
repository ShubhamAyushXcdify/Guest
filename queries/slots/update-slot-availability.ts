import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdateSlotAvailabilityParams {
  slotId: string;
  isAvailable: boolean;
}

async function updateSlotAvailability({ slotId, isAvailable }: UpdateSlotAvailabilityParams) {
  const res = await fetch(`/api/slots/${slotId}/available`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isAvailable }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.error || 'Failed to update slot availability');
  }
  return res.json();
}

export function useUpdateSlotAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSlotAvailability,
    onSuccess: () => {
      // Invalidate all slot queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}
