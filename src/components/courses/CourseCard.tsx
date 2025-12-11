import { Link } from "react-router-dom";
import { Clock, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Course } from "@/types/database";

interface CourseCardProps {
  course: Course;
  progress?: number;
  lessonCount?: number;
}

export function CourseCard({ course, progress = 0, lessonCount = 0 }: CourseCardProps) {
  const getStatusBadge = () => {
    if (progress === 0) {
      return <Badge variant="info">Nuevo</Badge>;
    }
    if (progress === 100) {
      return <Badge variant="success">Completado</Badge>;
    }
    return <Badge variant="warning">En progreso</Badge>;
  };

  return (
    <Link to={`/courses/${course.id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200 h-full">
        <div className="aspect-video relative bg-gray-100">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
              <BookOpen className="h-12 w-12 text-primary" />
            </div>
          )}
          <div className="absolute top-3 right-3">
            {getStatusBadge()}
          </div>
        </div>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold text-gray-900 line-clamp-2">
            {course.title}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2">
            {course.description}
          </p>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{lessonCount} lecciones</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          <Progress value={progress} className="h-1.5" />
        </CardContent>
      </Card>
    </Link>
  );
}
