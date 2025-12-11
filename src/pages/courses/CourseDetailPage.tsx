import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileDown, ChevronRight, ClipboardList } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { VideoPlayer } from "@/components/courses/VideoPlayer";
import { LessonList } from "@/components/courses/LessonList";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { debounce } from "@/lib/utils";
import type { Course, Lesson, UserProgress } from "@/types/database";

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<Record<string, UserProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseData();
  }, [id, user]);

  const fetchCourseData = async () => {
    if (!id || !user) return;

    try {
      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Fetch lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", id)
        .order("order_index", { ascending: true });

      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);

      // Set first lesson as current
      if (lessonsData && lessonsData.length > 0) {
        setCurrentLesson(lessonsData[0]);
      }

      // Fetch user progress
      const lessonIds = lessonsData?.map((l) => l.id) || [];
      if (lessonIds.length > 0) {
        const { data: progressData, error: progressError } = await supabase
          .from("user_progress")
          .select("*")
          .eq("user_id", user.id)
          .in("lesson_id", lessonIds);

        if (progressError) throw progressError;

        const progressMap: Record<string, UserProgress> = {};
        progressData?.forEach((p) => {
          progressMap[p.lesson_id] = p;
        });
        setProgress(progressMap);

        // Find first incomplete lesson
        const firstIncomplete = lessonsData?.find(
          (l) => !progressMap[l.id]?.completed
        );
        if (firstIncomplete) {
          setCurrentLesson(firstIncomplete);
        }
      }
    } catch (error) {
      console.error("Error fetching course:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = useCallback(
    debounce(async (lessonId: string, progressPercent: number) => {
      if (!user) return;

      const completed = progressPercent >= 90;

      const { error } = await supabase
        .from("user_progress")
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          progress_percent: Math.round(progressPercent),
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        }, {
          onConflict: "user_id,lesson_id",
        });

      if (!error) {
        setProgress((prev) => ({
          ...prev,
          [lessonId]: {
            ...prev[lessonId],
            id: prev[lessonId]?.id || "",
            user_id: user.id,
            lesson_id: lessonId,
            progress_percent: Math.round(progressPercent),
            completed,
            completed_at: completed ? new Date().toISOString() : null,
          },
        }));
      }
    }, 5000),
    [user]
  );

  const handleVideoProgress = (progressPercent: number) => {
    if (currentLesson) {
      saveProgress(currentLesson.id, progressPercent);
    }
  };

  const handleNextLesson = () => {
    const currentIndex = lessons.findIndex((l) => l.id === currentLesson?.id);
    if (currentIndex < lessons.length - 1) {
      setCurrentLesson(lessons[currentIndex + 1]);
    }
  };

  const calculateOverallProgress = () => {
    if (lessons.length === 0) return 0;
    const completedCount = lessons.filter(
      (l) => progress[l.id]?.completed
    ).length;
    return (completedCount / lessons.length) * 100;
  };

  const allLessonsCompleted = lessons.every((l) => progress[l.id]?.completed);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="aspect-video w-full rounded-xl" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">
          Curso no encontrado
        </h3>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Video player */}
        <VideoPlayer
          url={currentLesson.video_url}
          onProgress={handleVideoProgress}
          initialProgress={progress[currentLesson.id]?.progress_percent || 0}
        />

        {/* Lesson info */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">
              {currentLesson.title}
            </h1>
            {progress[currentLesson.id]?.completed && (
              <Button onClick={handleNextLesson} disabled={lessons.indexOf(currentLesson) === lessons.length - 1}>
                Siguiente lección
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>

          {currentLesson.description && (
            <p className="text-gray-600">{currentLesson.description}</p>
          )}

          {/* Resources */}
          {currentLesson.resources && currentLesson.resources.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Recursos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentLesson.resources.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <FileDown className="h-4 w-4 text-primary" />
                      <span className="text-sm text-gray-700">{resource.name}</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Take exam button */}
        {allLessonsCompleted && (
          <Button
            onClick={() => navigate(`/courses/${id}/exam`)}
            className="w-full"
            size="lg"
          >
            <ClipboardList className="mr-2 h-5 w-5" />
            Realizar Examen
          </Button>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{course.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Progreso general</span>
                <span className="font-medium text-gray-900">
                  {Math.round(calculateOverallProgress())}%
                </span>
              </div>
              <Progress value={calculateOverallProgress()} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Lecciones</CardTitle>
          </CardHeader>
          <CardContent>
            <LessonList
              lessons={lessons}
              currentLessonId={currentLesson.id}
              progress={progress}
              sequentialLock={course.sequential_lock}
              onSelectLesson={(lessonId) => {
                const lesson = lessons.find((l) => l.id === lessonId);
                if (lesson) setCurrentLesson(lesson);
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
