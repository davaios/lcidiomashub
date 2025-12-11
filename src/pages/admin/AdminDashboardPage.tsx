import { useState, useEffect } from "react";
import { Users, BookOpen, Award, Clock, Download } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/lib/supabase";
import { StatCard } from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import type { Profile } from "@/types/database";

interface EmployeeProgress {
  profile: Profile;
  totalCourses: number;
  completedCourses: number;
  progressPercent: number;
  lastActivity: string | null;
}

export function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    onboardingComplete: 0,
    avgCompletionRate: 0,
    avgOnboardingDays: 0,
  });
  const [employees, setEmployees] = useState<EmployeeProgress[]>([]);
  const [trendData, setTrendData] = useState<{ date: string; completions: number }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .neq("role", "super_admin");

      // Fetch all courses
      const { data: courses } = await supabase
        .from("courses")
        .select("id")
        .eq("is_published", true);

      // Fetch all lessons
      const { data: lessons } = await supabase.from("lessons").select("id, course_id");

      // Fetch all progress
      const { data: progress } = await supabase.from("user_progress").select("*");

      // Fetch certificates
      const { data: certificates } = await supabase.from("certificates").select("*");

      // Calculate employee progress
      const employeeProgress: EmployeeProgress[] = [];
      const courseIds = courses?.map((c) => c.id) || [];
      const lessonsByCourse: Record<string, number> = {};
      lessons?.forEach((l) => {
        lessonsByCourse[l.course_id] = (lessonsByCourse[l.course_id] || 0) + 1;
      });

      let totalComplete = 0;
      let totalCompletionRate = 0;

      profiles?.forEach((profile) => {
        const userProgress = progress?.filter((p) => p.user_id === profile.id) || [];
        const completedLessons = userProgress.filter((p) => p.completed);

        // Calculate completed courses
        const courseCompletion: Record<string, { completed: number; total: number }> = {};
        lessons?.forEach((l) => {
          if (!courseCompletion[l.course_id]) {
            courseCompletion[l.course_id] = { completed: 0, total: lessonsByCourse[l.course_id] };
          }
        });

        completedLessons.forEach((p) => {
          const lesson = lessons?.find((l) => l.id === p.lesson_id);
          if (lesson && courseCompletion[lesson.course_id]) {
            courseCompletion[lesson.course_id].completed++;
          }
        });

        let completedCourses = 0;
        Object.values(courseCompletion).forEach(({ completed, total }) => {
          if (completed === total && total > 0) completedCourses++;
        });

        const progressPercent =
          courseIds.length > 0 ? (completedCourses / courseIds.length) * 100 : 0;

        if (progressPercent === 100) totalComplete++;
        totalCompletionRate += progressPercent;

        const lastProgress = userProgress
          .filter((p) => p.completed_at)
          .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())[0];

        employeeProgress.push({
          profile,
          totalCourses: courseIds.length,
          completedCourses,
          progressPercent,
          lastActivity: lastProgress?.completed_at || null,
        });
      });

      setEmployees(employeeProgress);

      setStats({
        totalEmployees: profiles?.length || 0,
        onboardingComplete: Math.round((totalComplete / (profiles?.length || 1)) * 100),
        avgCompletionRate: Math.round(totalCompletionRate / (profiles?.length || 1)),
        avgOnboardingDays: 14, // Placeholder
      });

      // Generate trend data (mock)
      const trend = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i * 7);
        trend.push({
          date: date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" }),
          completions: Math.floor(Math.random() * 10) + 1,
        });
      }
      setTrendData(trend);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Nombre", "Email", "Departamento", "Progreso", "Última actividad"];
    const rows = filteredEmployees.map((e) => [
      e.profile.full_name,
      e.profile.id,
      e.profile.department,
      `${Math.round(e.progressPercent)}%`,
      e.lastActivity ? formatDate(e.lastActivity) : "-",
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "progreso-empleados.csv";
    a.click();
  };

  const getStatusBadge = (percent: number) => {
    if (percent === 0) return <Badge variant="destructive">Pendiente</Badge>;
    if (percent === 100) return <Badge variant="success">Completado</Badge>;
    return <Badge variant="warning">En progreso</Badge>;
  };

  const filteredEmployees = employees.filter((e) => {
    if (
      searchQuery &&
      !e.profile.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (departmentFilter !== "all" && e.profile.department !== departmentFilter) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="text-gray-500">
          Seguimiento del progreso de los empleados
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total empleados"
          value={stats.totalEmployees}
          icon={Users}
        />
        <StatCard
          title="Onboarding completado"
          value={`${stats.onboardingComplete}%`}
          icon={Award}
          iconClassName="bg-success-100"
        />
        <StatCard
          title="Tasa promedio"
          value={`${stats.avgCompletionRate}%`}
          icon={BookOpen}
          iconClassName="bg-accent-100"
        />
        <StatCard
          title="Días promedio"
          value={stats.avgOnboardingDays}
          icon={Clock}
          iconClassName="bg-primary-100"
        />
      </div>

      {/* Trend chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cursos completados por semana</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="completions"
                  stroke="#1E40AF"
                  strokeWidth={2}
                  dot={{ fill: "#1E40AF" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Employees table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Progreso de empleados</CardTitle>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <Input
              placeholder="Buscar por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="profesores">Profesores</SelectItem>
                <SelectItem value="administracion">Administración</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Progreso</TableHead>
                <TableHead>Última actividad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.profile.id}>
                  <TableCell className="font-medium">
                    {employee.profile.full_name}
                  </TableCell>
                  <TableCell className="capitalize text-gray-500">
                    {employee.profile.department}
                  </TableCell>
                  <TableCell>{getStatusBadge(employee.progressPercent)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${employee.progressPercent}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500">
                        {Math.round(employee.progressPercent)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {employee.lastActivity
                      ? formatDate(employee.lastActivity)
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
              {filteredEmployees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No se encontraron empleados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
