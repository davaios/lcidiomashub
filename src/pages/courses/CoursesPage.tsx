import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { CourseCard } from "@/components/courses/CourseCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Course } from "@/types/database";

type FilterType = "all" | "in_progress" | "completed" | "new";

export function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [lessonCounts, setLessonCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    if (!user) return;

    try {
      // Fetch published courses
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (coursesError) throw coursesError;

      // Fetch lessons count for each course
      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select("course_id");

      if (lessonsError) throw lessonsError;

      // Fetch user progress
      const { data: progressData, error: progressError } = await supabase
        .from("user_progress")
        .select("lesson_id, progress_percent, completed")
        .eq("user_id", user.id);

      if (progressError) throw progressError;

      // Calculate lesson counts
      const counts: Record<string, number> = {};
      lessonsData?.forEach((lesson) => {
        counts[lesson.course_id] = (counts[lesson.course_id] || 0) + 1;
      });
      setLessonCounts(counts);

      // Get lesson to course mapping
      const { data: allLessons } = await supabase
        .from("lessons")
        .select("id, course_id");

      const lessonToCourse: Record<string, string> = {};
      allLessons?.forEach((lesson) => {
        lessonToCourse[lesson.id] = lesson.course_id;
      });

      // Calculate course progress
      const courseProgress: Record<string, { total: number; completed: number }> = {};
      progressData?.forEach((p) => {
        const courseId = lessonToCourse[p.lesson_id];
        if (courseId) {
          if (!courseProgress[courseId]) {
            courseProgress[courseId] = { total: 0, completed: 0 };
          }
          courseProgress[courseId].total += 1;
          if (p.completed) {
            courseProgress[courseId].completed += 1;
          }
        }
      });

      const progressPercentages: Record<string, number> = {};
      Object.entries(courseProgress).forEach(([courseId, data]) => {
        const totalLessons = counts[courseId] || 1;
        progressPercentages[courseId] = (data.completed / totalLessons) * 100;
      });
      setProgress(progressPercentages);

      setCourses(coursesData || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    // Search filter
    if (
      searchQuery &&
      !course.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !course.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Status filter
    const courseProgress = progress[course.id] || 0;
    switch (filter) {
      case "new":
        return courseProgress === 0;
      case "in_progress":
        return courseProgress > 0 && courseProgress < 100;
      case "completed":
        return courseProgress === 100;
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Cursos</h1>
          <p className="text-gray-500">
            Explora y continúa tu formación
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar cursos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>

          <Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="new">Nuevos</SelectItem>
              <SelectItem value="in_progress">En progreso</SelectItem>
              <SelectItem value="completed">Completados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Course grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            No se encontraron cursos
          </h3>
          <p className="text-gray-500 mt-1">
            Prueba con otros términos de búsqueda o filtros
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              progress={progress[course.id] || 0}
              lessonCount={lessonCounts[course.id] || 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
