import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { PageSpinner } from "@/components/ui/Spinner";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { fetchPatient, createPatient, updatePatient } from "@/api/patients";
import { BLOOD_TYPES, PATIENT_STATUSES } from "@/lib/constants";
import { addToast } from "@/hooks/useToast";

const patientSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  dob: z.string().min(1, "Date of birth is required"),
  email: z.string().email("Invalid email").or(z.literal("")),
  phone: z.string(),
  address: z.string(),
  blood_type: z.string(),
  allergies: z.string(),
  conditions: z.string(),
  status: z.string(),
  last_visit: z.string(),
});

type PatientFormData = z.infer<typeof patientSchema>;

export function PatientFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);
  const patientId = Number(id);

  const {
    data: patient,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => fetchPatient(patientId),
    enabled: isEdit && !isNaN(patientId),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      dob: "",
      email: "",
      phone: "",
      address: "",
      blood_type: "",
      allergies: "",
      conditions: "",
      status: "Active",
      last_visit: "",
    },
  });

  useEffect(() => {
    if (patient) {
      reset({
        first_name: patient.first_name,
        last_name: patient.last_name,
        dob: patient.dob,
        email: patient.email || "",
        phone: patient.phone || "",
        address: patient.address || "",
        blood_type: patient.blood_type || "",
        allergies: patient.allergies || "",
        conditions: patient.conditions || "",
        status: patient.status,
        last_visit: patient.last_visit || "",
      });
    }
  }, [patient, reset]);

  const mutation = useMutation({
    mutationFn: (data: PatientFormData) => {
      const payload = {
        ...data,
        last_visit: data.last_visit || undefined,
      };
      if (isEdit) {
        return updatePatient(patientId, payload);
      }
      return createPatient(payload as Parameters<typeof createPatient>[0]);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      if (isEdit) {
        queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      }
      addToast(isEdit ? "Patient updated." : "Patient created.");
      navigate(`/patients/${isEdit ? patientId : result.id}`);
    },
    onError: () =>
      addToast(
        isEdit ? "Failed to update patient." : "Failed to create patient.",
        "error"
      ),
  });

  if (isEdit && isLoading) return <PageSpinner />;
  if (isEdit && isError)
    return <ErrorState message="Patient not found." />;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-md hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {isEdit ? "Edit Patient" : "New Patient"}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEdit
              ? "Update patient information."
              : "Add a new patient to the system."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
        {/* Personal Information */}
        <Card className="mb-6">
          <CardHeader>
            <h3 className="font-semibold text-foreground">
              Personal Information
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="First Name"
                error={errors.first_name?.message}
                required
              >
                <input
                  {...register("first_name")}
                  className={inputClass(errors.first_name)}
                  placeholder="John"
                />
              </Field>
              <Field
                label="Last Name"
                error={errors.last_name?.message}
                required
              >
                <input
                  {...register("last_name")}
                  className={inputClass(errors.last_name)}
                  placeholder="Doe"
                />
              </Field>
            </div>
            <Field
              label="Date of Birth"
              error={errors.dob?.message}
              required
            >
              <input
                type="date"
                {...register("dob")}
                className={inputClass(errors.dob)}
              />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Email" error={errors.email?.message}>
                <input
                  type="email"
                  {...register("email")}
                  className={inputClass(errors.email)}
                  placeholder="john@example.com"
                />
              </Field>
              <Field label="Phone" error={errors.phone?.message}>
                <input
                  {...register("phone")}
                  className={inputClass(errors.phone)}
                  placeholder="555-0101"
                />
              </Field>
            </div>
            <Field label="Address" error={errors.address?.message}>
              <input
                {...register("address")}
                className={inputClass(errors.address)}
                placeholder="123 Oak St, Springfield, IL"
              />
            </Field>
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card className="mb-6">
          <CardHeader>
            <h3 className="font-semibold text-foreground">
              Medical Information
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Blood Type">
                <select
                  {...register("blood_type")}
                  className={inputClass()}
                >
                  <option value="">Select...</option>
                  {BLOOD_TYPES.map((bt) => (
                    <option key={bt} value={bt}>
                      {bt}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Status">
                <select {...register("status")} className={inputClass()}>
                  {PATIENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Allergies">
              <input
                {...register("allergies")}
                className={inputClass()}
                placeholder="Penicillin, Sulfa drugs"
              />
            </Field>
            <Field label="Conditions">
              <input
                {...register("conditions")}
                className={inputClass()}
                placeholder="Hypertension, Type 2 Diabetes"
              />
            </Field>
            <Field label="Last Visit">
              <input
                type="date"
                {...register("last_visit")}
                className={inputClass()}
              />
            </Field>
          </CardContent>
        </Card>

        {/* Actions */}
        {mutation.isError && (
          <p className="text-sm text-destructive mb-4">
            {(mutation.error as Error).message || "Something went wrong."}
          </p>
        )}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {mutation.isPending && <Spinner className="h-4 w-4" />}
            {isEdit ? "Save Changes" : "Create Patient"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-input rounded-md text-sm font-medium hover:bg-muted transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

function inputClass(error?: { message?: string }) {
  return `w-full px-3 py-2 border rounded-md text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
    error ? "border-destructive" : "border-input"
  }`;
}
