import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Droplets,
  AlertTriangle,
  Stethoscope,
  Send,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { PageSpinner } from "@/components/ui/Spinner";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { fetchPatient, deletePatient } from "@/api/patients";
import { fetchNotes, createNote, deleteNote, fetchSummary } from "@/api/notes";
import { formatDate, calculateAge, cn } from "@/lib/utils";
import { addToast } from "@/hooks/useToast";

type Tab = "overview" | "notes" | "summary";

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const patientId = Number(id);

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [noteContent, setNoteContent] = useState("");

  const {
    data: patient,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => fetchPatient(patientId),
    enabled: !isNaN(patientId),
  });

  const { data: notes = [], isLoading: notesLoading } = useQuery({
    queryKey: ["patient-notes", patientId],
    queryFn: () => fetchNotes(patientId),
    enabled: !isNaN(patientId),
  });

  const {
    data: summaryData,
    isLoading: summaryLoading,
  } = useQuery({
    queryKey: ["patient-summary", patientId],
    queryFn: () => fetchSummary(patientId),
    enabled: activeTab === "summary" && !isNaN(patientId),
  });

  const addNoteMutation = useMutation({
    mutationFn: (content: string) => createNote(patientId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-notes", patientId] });
      queryClient.invalidateQueries({
        queryKey: ["patient-summary", patientId],
      });
      setNoteContent("");
      addToast("Note added.");
    },
    onError: () => addToast("Failed to add note.", "error"),
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: number) => deleteNote(patientId, noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-notes", patientId] });
      queryClient.invalidateQueries({
        queryKey: ["patient-summary", patientId],
      });
      addToast("Note deleted.");
    },
    onError: () => addToast("Failed to delete note.", "error"),
  });

  const deletePatientMutation = useMutation({
    mutationFn: () => deletePatient(patientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      addToast("Patient deleted.");
      navigate("/patients");
    },
    onError: () => addToast("Failed to delete patient.", "error"),
  });

  function handleDeletePatient() {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      deletePatientMutation.mutate();
    }
  }

  function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteContent.trim()) return;
    addNoteMutation.mutate(noteContent.trim());
  }

  if (isLoading) return <PageSpinner />;
  if (isError || !patient)
    return <ErrorState message="Patient not found." onRetry={refetch} />;

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "notes", label: `Notes (${notes.length})` },
    { key: "summary", label: "Summary" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/patients")}
            className="p-2 rounded-md hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-foreground">
                {patient.first_name} {patient.last_name}
              </h2>
              <StatusBadge status={patient.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {calculateAge(patient.dob)} years old &middot;{" "}
              {patient.blood_type || "Unknown"} blood type
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/patients/${patientId}/edit`}
            className="flex items-center gap-2 px-4 py-2 border border-input rounded-md text-sm font-medium hover:bg-muted transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Link>
          <button
            onClick={handleDeletePatient}
            disabled={deletePatientMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 border border-destructive/30 text-destructive rounded-md text-sm font-medium hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-6">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "pb-3 text-sm font-medium transition-colors border-b-2",
                activeTab === key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-foreground">
                Contact Information
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow icon={Mail} label="Email" value={patient.email} />
              <InfoRow icon={Phone} label="Phone" value={patient.phone} />
              <InfoRow icon={MapPin} label="Address" value={patient.address} />
            </CardContent>
          </Card>

          {/* Medical Info */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-foreground">
                Medical Information
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow
                icon={Droplets}
                label="Blood Type"
                value={patient.blood_type}
              />
              <InfoRow
                icon={AlertTriangle}
                label="Allergies"
                value={patient.allergies}
              />
              <InfoRow
                icon={Stethoscope}
                label="Conditions"
                value={patient.conditions}
              />
              <InfoRow
                icon={FileText}
                label="Last Visit"
                value={
                  patient.last_visit ? formatDate(patient.last_visit) : null
                }
              />
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "notes" && (
        <div className="space-y-6">
          {/* Add Note Form */}
          <Card>
            <CardContent>
              <form onSubmit={handleAddNote} className="space-y-3">
                <textarea
                  placeholder="Add a clinical note..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-input rounded-md text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={
                      !noteContent.trim() || addNoteMutation.isPending
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {addNoteMutation.isPending ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Add Note
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Notes List */}
          {notesLoading ? (
            <PageSpinner />
          ) : notes.length === 0 ? (
            <Card>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  No clinical notes yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <Card key={note.id}>
                  <CardContent>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-foreground leading-relaxed">
                          {note.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(note.timestamp)}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteNoteMutation.mutate(note.id)}
                        disabled={deleteNoteMutation.isPending}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "summary" && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-foreground">Patient Summary</h3>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="flex items-center gap-3 py-8 justify-center">
                <Spinner />
                <p className="text-muted-foreground text-sm">
                  Generating summary...
                </p>
              </div>
            ) : summaryData ? (
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                {summaryData.summary}
              </p>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Unable to generate summary.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground">{value || "—"}</p>
      </div>
    </div>
  );
}
