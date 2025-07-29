import { useQuery } from "@tanstack/react-query";

export interface DewormingNoteDetail {
  id: string;
  visitId: string;
  adverseReactions?: string;
  additionalNotes?: string;
  ownerConcerns?: string;
  followUpRequired: boolean;
  resolutionStatus?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

const getDewormingNoteByVisitId = async (visitId: string): Promise<DewormingNoteDetail[] | null> => {
  if (!visitId) {
    throw new Error('Visit ID is required');
  }
  const response = await fetch(`/api/deworming/note/visit/${visitId}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch deworming note by visitId');
  }
  return response.json();
};

export const useGetDewormingNoteByVisitId = (visitId: string, enabled = true) => {
  return useQuery({
    queryKey: ['dewormingNoteByVisitId', visitId],
    queryFn: () => getDewormingNoteByVisitId(visitId),
    enabled: !!visitId && enabled,
  });
}; 