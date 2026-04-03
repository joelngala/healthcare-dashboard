import { lazy, Suspense } from "react";
import { createHashRouter, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageSpinner } from "@/components/ui/Spinner";

const DashboardPage = lazy(() =>
  import("@/pages/DashboardPage").then((m) => ({ default: m.DashboardPage }))
);
const PatientsPage = lazy(() =>
  import("@/pages/PatientsPage").then((m) => ({ default: m.PatientsPage }))
);
const PatientDetailPage = lazy(() =>
  import("@/pages/PatientDetailPage").then((m) => ({
    default: m.PatientDetailPage,
  }))
);
const PatientFormPage = lazy(() =>
  import("@/pages/PatientFormPage").then((m) => ({
    default: m.PatientFormPage,
  }))
);
const NotFoundPage = lazy(() =>
  import("@/pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage }))
);

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageSpinner />}>{children}</Suspense>;
}

function KeyedPatientForm() {
  const { id } = useParams();
  return (
    <Lazy>
      <PatientFormPage key={id ?? "new"} />
    </Lazy>
  );
}

export const router = createHashRouter([
  {
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: (
          <Lazy>
            <DashboardPage />
          </Lazy>
        ),
      },
      {
        path: "patients",
        element: (
          <Lazy>
            <PatientsPage />
          </Lazy>
        ),
      },
      { path: "patients/new", element: <KeyedPatientForm /> },
      {
        path: "patients/:id",
        element: (
          <Lazy>
            <PatientDetailPage />
          </Lazy>
        ),
      },
      { path: "patients/:id/edit", element: <KeyedPatientForm /> },
      {
        path: "*",
        element: (
          <Lazy>
            <NotFoundPage />
          </Lazy>
        ),
      },
    ],
  },
]);
