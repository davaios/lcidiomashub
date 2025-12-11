import { useState, useEffect } from "react";
import { BookOpen, Award, Clock, Trophy } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import type { Course, Certificate, QuizAttempt } from "@/types/database";

interface DashboardStats {
  completedCourses: number;
  inProgressCourses: number;
  certificates: number;
  totalHours: number;
}

interface CourseHistory {
  course: Course;
  startDate: string;
  endDate: string | null;
  score: number | null;
  status: "completed" | "in_progress" | "not_started";
}

const CHART_COLORS = ["#10B981", "#F59E0B", "#E5E7EB"];

const BADGES = [
  { id: "first_course", name: "Primer Curso", icon: BookOpen, unlockAt: 1 },
  { id: "five_courses", name: "5 Cursos", icon: Trophy, unlockAt: 5 },
  { id: "perfect_score", name: "Puntuación Perfecta", icon: Award, unlockAt: 100 },
];

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [certificates, setCertificates] = useState<(Certificate & { course?: Course })[]>([]);
  const [history, setHistory] = useState<CourseHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch all courses
      const { data: courses } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true);

      // Fetch user progress
      const { data: progressData } = await supabase
        .from("user_progress")
        .select("*, lessons(course_id, duration_seconds)")
        .eq("user_id", user.id);

      // Fetch certificates
      const { data: certsData } = await supabase
        .from("certificates")
        .select("*, courses(*)")
        .eq("user_id", user.id);

      // Fetch quiz attempts
      const { data: attemptsData } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("user_id", user.id)
        .eq("passed", true);

      // Calculate stats
      const courseProgress: Record<string, { completed: number; total: number }> = {};
      let totalSeconds = 0;

      progressData?.forEach((p: any) => {
        const courseId = p.lessons?.course_id;
        if (courseId) {
          if (!courseProgress[courseId]) {
            courseProgress[courseId] = { completed: 0, total: 0 };
          }
          courseProgress[courseId].total += 1;
          if (p.completed) {
            courseProgress[courseId].completed += 1;
            totalSeconds += p.lessons?.duration_seconds || 0;
          }
        }
      });

      // Get lessons count per course
      const { data: lessonsData } = await supabase
        .from("lessons")
        .select("course_id");

      const lessonCounts: Record<string, number> = {};
      lessonsData?.forEach((l: any) => {
        lessonCounts[l.course_id] = (lessonCounts[l.course_id] || 0) + 1;
      });

      let completed = 0;
      let inProgress = 0;

      courses?.forEach((course) => {
        const progress = courseProgress[course.id];
        const totalLessons = lessonCounts[course.id] || 0;
        if (progress && progress.completed === totalLessons && totalLessons > 0) {
          completed++;
        } else if (progress && progress.completed > 0) {
          inProgress++;
        }
      });

      setStats({
        completedCourses: completed,
        inProgressCourses: inProgress,
        certificates: certsData?.length || 0,
        totalHours: Math.round(totalSeconds / 3600),
      });

      setCertificates(
        certsData?.map((c: any) => ({
          ...c,
          course: c.courses,
        })) || []
      );

      // Build history
      const historyData: CourseHistory[] = [];
      courses?.forEach((course) => {
        const progress = courseProgress[course.id];
        const totalLessons = lessonCounts[course.id] || 0;
        const attempt = attemptsData?.find((a: any) => a.course_id === course.id);

        let status: CourseHistory["status"] = "not_started";
        if (progress && progress.completed === totalLessons && totalLessons > 0) {
          status = "completed";
        } else if (progress && progress.completed > 0) {
          status = "in_progress";
        }

        if (status !== "not_started") {
          historyData.push({
            course,
            startDate: course.created_at,
            endDate: status === "completed" ? new Date().toISOString() : null,
            score: attempt?.score || null,
            status,
          });
        }
      });

      setHistory(historyData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = stats
    ? [
        { name: "Completados", value: stats.completedCourses },
        { name: "En progreso", value: stats.inProgressCourses },
        { name: "Pendientes", value: Math.max(0, 10 - stats.completedCourses - stats.inProgressCourses) },
      ]
    : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi Evolución</h1>
        <p className="text-gray-500">
          Seguimiento de tu progreso y logros
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Cursos completados"
          value={stats?.completedCourses || 0}
          icon={BookOpen}
        />
        <StatCard
          title="Cursos en progreso"
          value={stats?.inProgressCourses || 0}
          icon={Clock}
          iconClassName="bg-accent-100"
        />
        <StatCard
          title="Certificados"
          value={stats?.certificates || 0}
          icon={Award}
          iconClassName="bg-success-100"
        />
        <StatCard
          title="Horas de formación"
          value={stats?.totalHours || 0}
          icon={Trophy}
          iconClassName="bg-primary-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Progreso General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Insignias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {BADGES.map((badge) => {
                const unlocked =
                  badge.id === "first_course"
                    ? (stats?.completedCourses || 0) >= 1
                    : badge.id === "five_courses"
                    ? (stats?.completedCourses || 0) >= 5
                    : false;

                return (
                  <div
                    key={badge.id}
                    className={`flex flex-col items-center p-4 rounded-xl ${
                      unlocked
                        ? "bg-accent-50"
                        : "bg-gray-50 opacity-50"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        unlocked ? "bg-accent" : "bg-gray-200"
                      }`}
                    >
                      <badge.icon
                        className={`h-6 w-6 ${
                          unlocked ? "text-white" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <p
                      className={`text-sm font-medium mt-2 text-center ${
                        unlocked ? "text-accent-700" : "text-gray-400"
                      }`}
                    >
                      {badge.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certificates */}
      {certificates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mis Certificados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {certificates.map((cert) => (
                <a
                  key={cert.id}
                  href={cert.certificate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 border border-gray-100 rounded-xl hover:border-primary hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                      <Award className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {cert.course?.title || "Certificado"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(cert.issued_at)}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historial de Cursos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Curso
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Fecha inicio
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Fecha fin
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Nota
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.course.id} className="border-b border-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {item.course.title}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {formatDate(item.startDate)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {item.endDate ? formatDate(item.endDate) : "-"}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {item.score !== null ? `${item.score}%` : "-"}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          item.status === "completed"
                            ? "success"
                            : item.status === "in_progress"
                            ? "warning"
                            : "secondary"
                        }
                      >
                        {item.status === "completed"
                          ? "Completado"
                          : item.status === "in_progress"
                          ? "En progreso"
                          : "No iniciado"}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-sm text-gray-500"
                    >
                      No hay cursos en tu historial
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
