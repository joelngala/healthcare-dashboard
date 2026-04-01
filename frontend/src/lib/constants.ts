export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "/api";

export const PATIENT_STATUSES = [
  "Active",
  "Inactive",
  "Follow-up",
] as const;

export type PatientStatus = (typeof PATIENT_STATUSES)[number];

export const BLOOD_TYPES = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export const STATUS_COLORS: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  Inactive: "bg-gray-100 text-gray-600",
  "Follow-up": "bg-amber-100 text-amber-700",
};

export const PAGE_SIZE = 10;
