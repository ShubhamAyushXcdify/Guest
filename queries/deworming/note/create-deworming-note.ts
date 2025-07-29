import { useMutation } from "@tanstack/react-query";

export interface CreateDewormingNoteDto {
  visitId: string;
  adverseReactions?: string;
  additionalNotes?: string;
  ownerConcerns?: string;
  followUpRequired?: boolean;
  resolutionStatus?: string;
  isCompleted?: boolean;
}

const createDewormingNote = async (data: CreateDewormingNoteDto) => {
  const response = await fetch(`/api/deworming/note`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create deworming note');
  }
  return response.json();
};

export const useCreateDewormingNote = () => {
  return useMutation({
    mutationFn: createDewormingNote,
  });
}; 