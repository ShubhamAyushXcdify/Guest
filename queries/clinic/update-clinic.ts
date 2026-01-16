import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateClinicData {
  id: string;
  [key: string]: any;
}

const updateClinic = async (data: UpdateClinicData) => {
 const { id, ...payload } = data;

  // Build a sanitized payload: remove empty string, null, undefined
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (key === "location") continue; // handle below
    if (value === "" || value === null || typeof value === "undefined") continue;
    sanitized[key] = value;
  }

  // Handle nested location object carefully: only include if meaningful values are provided
  if (typeof payload.location === "object" && payload.location !== null) {
    const { lat, lng, address } = payload.location as { lat?: number; lng?: number; address?: string };
    const hasMeaningfulCoords = typeof lat === "number" && typeof lng === "number" && !(lat === 0 && lng === 0);
    const hasAddress = typeof address === "string" && address.trim().length > 0;
    if (hasMeaningfulCoords || hasAddress) {
      const loc: Record<string, any> = {};
      if (typeof lat === "number") loc.lat = lat;
      if (typeof lng === "number") loc.lng = lng;
      if (hasAddress) loc.address = address;
      sanitized.location = loc;
    }
  }
    const requestBody = { ...payload, id };

  const response = await fetch(`/api/clinic/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
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
