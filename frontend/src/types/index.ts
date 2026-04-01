export interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  dob: string;
  email: string;
  phone: string;
  address: string;
  blood_type: string;
  allergies: string;
  conditions: string;
  status: string;
  last_visit: string;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: number;
  patient_id: number;
  content: string;
  timestamp: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface PatientFilters {
  search?: string;
  status?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  page?: number;
  page_size?: number;
}

export interface DashboardStats {
  total_patients: number;
  active_patients: number;
  needs_followup: number;
  seen_this_month: number;
  status_breakdown: { status: string; count: number }[];
  recent_patients: Patient[];
}
