import { api } from "./client";
import type { Note } from "@/types";

export function fetchNotes(patientId: number) {
  return api.get<Note[]>(`/patients/${patientId}/notes`);
}

export function createNote(patientId: number, content: string) {
  return api.post<Note>(`/patients/${patientId}/notes`, { content });
}

export function deleteNote(patientId: number, noteId: number) {
  return api.delete<void>(`/patients/${patientId}/notes/${noteId}`);
}

export function fetchSummary(patientId: number) {
  return api.get<{ summary: string }>(`/patients/${patientId}/summary`);
}
