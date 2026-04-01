import { api } from "./client";
import type {
  Patient,
  PaginatedResponse,
  PatientFilters,
  DashboardStats,
} from "@/types";

export function fetchPatients(filters: PatientFilters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.sort_by) params.set("sort_by", filters.sort_by);
  if (filters.sort_order) params.set("sort_order", filters.sort_order);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));

  const qs = params.toString();
  return api.get<PaginatedResponse<Patient>>(
    `/patients${qs ? `?${qs}` : ""}`
  );
}

export function fetchPatient(id: number) {
  return api.get<Patient>(`/patients/${id}`);
}

export function createPatient(data: Omit<Patient, "id" | "created_at" | "updated_at">) {
  return api.post<Patient>("/patients", data);
}

export function updatePatient(
  id: number,
  data: Partial<Omit<Patient, "id" | "created_at" | "updated_at">>
) {
  return api.put<Patient>(`/patients/${id}`, data);
}

export function deletePatient(id: number) {
  return api.delete<void>(`/patients/${id}`);
}

export function fetchDashboardStats() {
  return api.get<DashboardStats>("/dashboard/stats");
}
