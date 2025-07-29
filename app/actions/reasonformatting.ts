'use server';
import { aiFormat } from "@/services/AI/aiFormatting";

export async function reasonFormatting(reason: string) {
    try {
        const formattedReason = await aiFormat({
            provider: 'groq',
            systemPrompt: 'You are a helpful assistant that formats reasons for appointments. You will be given a reason for an appointment and you will need to format it into a more readable format. You will also need to add a reason for the appointment. Return only the plain formatted text, with no extra explanations or phrases like "Here is the result".',
            userPrompt: reason,
        });
        return formattedReason;
    } catch (error) {
        console.error(error);
        return reason;
    }
}

export async function notesFormatting(notes: string) {
    try {
        const formattedNotes = await aiFormat({
            provider: 'groq',
            systemPrompt: 'You are a helpful assistant that formats appointment notes. You will be given raw notes for an appointment and you will need to format them into a clear, professional, and readable format. Do not change the meaning, just improve clarity and structure. Return only the plain formatted text, with no extra explanations or phrases like "Here is the result".',
            userPrompt: notes,
        });
        return formattedNotes;
    } catch (error) {
        console.error(error);
        return notes;
    }
}
