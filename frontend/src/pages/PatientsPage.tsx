import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { PageSpinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDebounce } from "@/hooks/useDebounce";
import { fetchPatients } from "@/api/patients";
import { formatDate, calculateAge, cn } from "@/lib/utils";
import { PATIENT_STATUSES, PAGE_SIZE } from "@/lib/constants";
import type { PatientFilters } from "@/types";

type SortField = "last_name" | "last_visit" | "dob" | "status";

export function PatientsPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("last_visit");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search);

  const filters: PatientFilters = {
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
    page,
    page_size: PAGE_SIZE,
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["patients", filters],
    queryFn: () => fetchPatients(filters),
  });

  function handleSort(field: SortField) {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortBy !== field)
      return <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />;
    return sortOrder === "asc" ? (
      <ChevronUp className="h-3.5 w-3.5" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5" />
    );
  }

  const columns: { label: string; field: SortField }[] = [
    { label: "Name", field: "last_name" },
    { label: "Age", field: "dob" },
    { label: "Status", field: "status" },
    { label: "Last Visit", field: "last_visit" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Patients</h2>
          <p className="text-muted-foreground mt-1">
            {data ? `${data.total} patients total` : "Manage and view all patients."}
          </p>
        </div>
        <button
          onClick={() => navigate("/patients/new")}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          Add Patient
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-input rounded-md text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Statuses</option>
          {PATIENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <PageSpinner />
      ) : isError ? (
        <ErrorState message="Failed to load patients." onRetry={refetch} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  {columns.map(({ label, field }) => (
                    <th key={field} className="px-6 py-3">
                      <button
                        onClick={() => handleSort(field)}
                        className="flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {label}
                        <SortIcon field={field} />
                      </button>
                    </th>
                  ))}
                  <th className="px-6 py-3 font-medium text-muted-foreground">
                    Blood Type
                  </th>
                  <th className="px-6 py-3 font-medium text-muted-foreground">
                    Conditions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((patient) => (
                  <tr
                    key={patient.id}
                    onClick={() => navigate(`/patients/${patient.id}`)}
                    className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">
                        {patient.first_name} {patient.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {patient.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {calculateAge(patient.dob)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={patient.status} />
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {patient.last_visit
                        ? formatDate(patient.last_visit)
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {patient.blood_type || "—"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground max-w-[200px] truncate">
                      {patient.conditions || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.total_pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                {(data.page - 1) * data.page_size + 1}–
                {Math.min(data.page * data.page_size, data.total)} of{" "}
                {data.total}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={cn(
                    "p-2 rounded-md transition-colors",
                    page === 1
                      ? "text-muted-foreground/40 cursor-not-allowed"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: data.total_pages }, (_, i) => i + 1).map(
                  (n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={cn(
                        "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                        n === page
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {n}
                    </button>
                  )
                )}
                <button
                  onClick={() =>
                    setPage((p) => Math.min(data.total_pages, p + 1))
                  }
                  disabled={page === data.total_pages}
                  className={cn(
                    "p-2 rounded-md transition-colors",
                    page === data.total_pages
                      ? "text-muted-foreground/40 cursor-not-allowed"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
