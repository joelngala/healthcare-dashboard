import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Users, UserCheck, UserPlus, CalendarCheck } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { PageSpinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { fetchDashboardStats } from "@/api/patients";
import { formatDate, calculateAge } from "@/lib/utils";
import type { DashboardStats } from "@/types";

const PIE_COLORS: Record<string, string> = {
  Active: "#0f766e",
  "Follow-up": "#d97706",
  Inactive: "#9ca3af",
};

const KPI_CARDS = [
  {
    key: "total_patients" as const,
    label: "Total Patients",
    icon: Users,
    color: "text-blue-600 bg-blue-50",
  },
  {
    key: "active_patients" as const,
    label: "Active Patients",
    icon: UserCheck,
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    key: "needs_followup" as const,
    label: "Needs Follow-up",
    icon: UserPlus,
    color: "text-amber-600 bg-amber-50",
  },
  {
    key: "seen_this_month" as const,
    label: "Seen This Month",
    icon: CalendarCheck,
    color: "text-purple-600 bg-purple-50",
  },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
  });

  if (isLoading) return <PageSpinner />;
  if (isError || !data)
    return <ErrorState message="Failed to load dashboard." onRetry={refetch} />;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          Overview of patient activity and metrics.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map(({ key, label, icon: Icon, color }) => (
          <Card key={key}>
            <CardContent className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold text-foreground">
                  {data[key]}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-foreground">
              Status Breakdown
            </h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={data.status_breakdown}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {data.status_breakdown.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={PIE_COLORS[entry.status] || "#cbd5e1"}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Patients */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="font-semibold text-foreground">
              Recent Patients
            </h3>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Age</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Last Visit</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_patients.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/patients/${p.id}`)}
                    className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-3 font-medium text-foreground">
                      {p.first_name} {p.last_name}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {calculateAge(p.dob)}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {p.last_visit ? formatDate(p.last_visit) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
