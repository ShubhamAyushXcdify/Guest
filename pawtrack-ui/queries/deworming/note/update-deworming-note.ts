import { useMutation } from "@tanstack/react-query";

export interface UpdateDewormingNoteDto {
  id: string;
  visitId: string;
  adverseReactions?: string;
  additionalNotes?: string;
  ownerConcerns?: string;
  followUpRequired?: boolean;
  resolutionStatus?: string;
  isCompleted?: boolean;
}

const updateDewormingNote = async (data: UpdateDewormingNoteDto) => {
  const response = await fetch(`/api/deworming/note/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update deworming note');
  }
  return response.json();
};

export const useUpdateDewormingNote = () => {
  return useMutation({
    mutationFn: updateDewormingNote,
  });
}; 