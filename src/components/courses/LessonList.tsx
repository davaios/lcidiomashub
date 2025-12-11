import { Check, Lock, Play } from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Lesson, UserProgress } from "@/types/database";

interface LessonListProps {
  lessons: Lesson[];
  currentLessonId: string;
  progress: Record<string, UserProgress>;
  sequentialLock: boolean;
  onSelectLesson: (lessonId: string) => void;
}

export function LessonList({
  lessons,
  currentLessonId,
  progress,
  sequentialLock,
  onSelectLesson,
}: LessonListProps) {
  const isLessonLocked = (index: number) => {
    if (!sequentialLock) return false;
    if (index === 0) return false;

    const previousLesson = lessons[index - 1];
    const previousProgress = progress[previousLesson.id];
    return !previousProgress?.completed;
  };

  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div className="space-y-1 pr-4">
        {lessons
          .sort((a, b) => a.order_index - b.order_index)
          .map((lesson, index) => {
            const lessonProgress = progress[lesson.id];
            const isCompleted = lessonProgress?.completed;
            const isCurrent = lesson.id === currentLessonId;
            const isLocked = isLessonLocked(index);

            return (
              <button
                key={lesson.id}
                onClick={() => !isLocked && onSelectLesson(lesson.id)}
                disabled={isLocked}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors",
                  isCurrent
                    ? "bg-primary/10 text-primary"
                    : isLocked
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-100"
                )}
              >
                <div
                  className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium",
                    isCompleted
                      ? "bg-success text-white"
                      : isCurrent
                      ? "bg-primary text-white"
                      : isLocked
                      ? "bg-gray-200 text-gray-400"
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : isLocked ? (
                    <Lock className="h-4 w-4" />
                  ) : isCurrent ? (
                    <Play className="h-3 w-3" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium truncate",
                      isCurrent ? "text-primary" : "text-gray-900"
                    )}
                  >
                    {lesson.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDuration(lesson.duration_seconds)}
                  </p>
                </div>
              </button>
            );
          })}
      </div>
    </ScrollArea>
  );
}
