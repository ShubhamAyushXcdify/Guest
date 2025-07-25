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

const getDewormingNoteById = async (id: string): Promise<DewormingNoteDetail> => {
  if (!id) {
    throw new Error('DewormingNote ID is required');
  }
  
  const response = await fetch(`/api/deworming/note/${id}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch deworming note data');
  }
  
  return response.json();
};

export const useGetDewormingNoteById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['dewormingNote', id],
    queryFn: () => getDewormingNoteById(id),
    enabled: !!id && enabled,
  });
}; 