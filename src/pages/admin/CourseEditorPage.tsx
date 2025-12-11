import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus, GripVertical, Trash2, Pencil } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatDuration } from "@/lib/utils";
import type { Course, Lesson, QuizQuestion } from "@/types/database";

export function CourseEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState<Partial<Course>>({
    title: "",
    description: "",
    thumbnail_url: "",
    is_published: false,
    passing_score: 70,
    sequential_lock: true,
  });
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [lessonDialog, setLessonDialog] = useState<Partial<Lesson> | null>(null);
  const [questionDialog, setQuestionDialog] = useState<Partial<QuizQuestion> | null>(null);

  useEffect(() => {
    if (!isNew && id) {
      fetchCourse();
    }
  }, [id]);

  const fetchCourse = async () => {
    if (!id) return;

    const { data: courseData } = await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .single();

    if (courseData) {
      setCourse(courseData);
    }

    const { data: lessonsData } = await supabase
      .from("lessons")
      .select("*")
      .eq("course_id", id)
      .order("order_index");

    if (lessonsData) {
      setLessons(lessonsData);
    }

    const { data: questionsData } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("course_id", id)
      .order("order_index");

    if (questionsData) {
      setQuestions(questionsData);
    }

    setLoading(false);
  };

  const handleSaveCourse = async () => {
    if (!user || !course.title) return;

    setSaving(true);

    try {
      if (isNew) {
        const { data, error } = await supabase
          .from("courses")
          .insert({
            ...course,
            created_by: user.id,
          })
          .select()
          .single();

        if (!error && data) {
          navigate(`/admin/courses/${data.id}/edit`, { replace: true });
        }
      } else {
        await supabase
          .from("courses")
          .update(course)
          .eq("id", id);
      }
    } catch (error) {
      console.error("Error saving course:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLesson = async () => {
    if (!lessonDialog || !id) return;

    const isEditing = !!lessonDialog.id;

    if (isEditing) {
      const { error } = await supabase
        .from("lessons")
        .update(lessonDialog)
        .eq("id", lessonDialog.id);

      if (!error) {
        setLessons((prev) =>
          prev.map((l) => (l.id === lessonDialog.id ? { ...l, ...lessonDialog } as Lesson : l))
        );
      }
    } else {
      const { data, error } = await supabase
        .from("lessons")
        .insert({
          ...lessonDialog,
          course_id: id,
          order_index: lessons.length,
        })
        .select()
        .single();

      if (!error && data) {
        setLessons((prev) => [...prev, data]);
      }
    }

    setLessonDialog(null);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    await supabase.from("lessons").delete().eq("id", lessonId);
    setLessons((prev) => prev.filter((l) => l.id !== lessonId));
  };

  const handleSaveQuestion = async () => {
    if (!questionDialog || !id) return;

    const isEditing = !!questionDialog.id;

    if (isEditing) {
      const { error } = await supabase
        .from("quiz_questions")
        .update(questionDialog)
        .eq("id", questionDialog.id);

      if (!error) {
        setQuestions((prev) =>
          prev.map((q) => (q.id === questionDialog.id ? { ...q, ...questionDialog } as QuizQuestion : q))
        );
      }
    } else {
      const { data, error } = await supabase
        .from("quiz_questions")
        .insert({
          ...questionDialog,
          course_id: id,
          order_index: questions.length,
        })
        .select()
        .single();

      if (!error && data) {
        setQuestions((prev) => [...prev, data]);
      }
    }

    setQuestionDialog(null);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    await supabase.from("quiz_questions").delete().eq("id", questionId);
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/courses")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? "Nuevo Curso" : "Editar Curso"}
          </h1>
        </div>

        <Button onClick={handleSaveCourse} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="lessons" disabled={isNew}>
            Lecciones ({lessons.length})
          </TabsTrigger>
          <TabsTrigger value="exam" disabled={isNew}>
            Examen ({questions.length})
          </TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info" className="mt-6">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título del curso *</Label>
                <Input
                  id="title"
                  value={course.title || ""}
                  onChange={(e) =>
                    setCourse((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Ej: Introducción a la enseñanza"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={course.description || ""}
                  onChange={(e) =>
                    setCourse((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Describe el contenido del curso..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">URL de la miniatura</Label>
                <Input
                  id="thumbnail"
                  value={course.thumbnail_url || ""}
                  onChange={(e) =>
                    setCourse((prev) => ({ ...prev, thumbnail_url: e.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passing-score">Nota mínima para aprobar (%)</Label>
                <Input
                  id="passing-score"
                  type="number"
                  min={0}
                  max={100}
                  value={course.passing_score || 70}
                  onChange={(e) =>
                    setCourse((prev) => ({
                      ...prev,
                      passing_score: parseInt(e.target.value),
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Bloqueo secuencial</Label>
                  <p className="text-sm text-gray-500">
                    Los usuarios deben completar las lecciones en orden
                  </p>
                </div>
                <Switch
                  checked={course.sequential_lock ?? true}
                  onCheckedChange={(checked) =>
                    setCourse((prev) => ({ ...prev, sequential_lock: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Publicado</Label>
                  <p className="text-sm text-gray-500">
                    El curso será visible para los usuarios
                  </p>
                </div>
                <Switch
                  checked={course.is_published ?? false}
                  onCheckedChange={(checked) =>
                    setCourse((prev) => ({ ...prev, is_published: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lessons Tab */}
        <TabsContent value="lessons" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Lecciones</CardTitle>
              <Button
                size="sm"
                onClick={() =>
                  setLessonDialog({
                    title: "",
                    description: "",
                    video_url: "",
                    duration_seconds: 0,
                    resources: [],
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Añadir Lección
              </Button>
            </CardHeader>
            <CardContent>
              {lessons.length === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  No hay lecciones. Añade la primera.
                </p>
              ) : (
                <div className="space-y-2">
                  {lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                    >
                      <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                      <span className="w-6 h-6 bg-primary-100 text-primary rounded-lg flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{lesson.title}</p>
                        <p className="text-sm text-gray-500">
                          {formatDuration(lesson.duration_seconds)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setLessonDialog(lesson)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteLesson(lesson.id)}
                      >
                        <Trash2 className="h-4 w-4 text-error" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exam Tab */}
        <TabsContent value="exam" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Preguntas del examen</CardTitle>
              <Button
                size="sm"
                onClick={() =>
                  setQuestionDialog({
                    question_text: "",
                    options: ["", ""],
                    correct_answer_index: 0,
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Añadir Pregunta
              </Button>
            </CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  No hay preguntas. Añade la primera.
                </p>
              ) : (
                <div className="space-y-2">
                  {questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                    >
                      <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                      <span className="w-6 h-6 bg-primary-100 text-primary rounded-lg flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 line-clamp-1">
                          {question.question_text}
                        </p>
                        <p className="text-sm text-gray-500">
                          {question.options.length} opciones
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setQuestionDialog(question)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteQuestion(question.id)}
                      >
                        <Trash2 className="h-4 w-4 text-error" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Lesson Dialog */}
      <Dialog open={!!lessonDialog} onOpenChange={() => setLessonDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {lessonDialog?.id ? "Editar Lección" : "Nueva Lección"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                value={lessonDialog?.title || ""}
                onChange={(e) =>
                  setLessonDialog((prev) => prev && { ...prev, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={lessonDialog?.description || ""}
                onChange={(e) =>
                  setLessonDialog((prev) => prev && { ...prev, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>URL del video *</Label>
              <Input
                value={lessonDialog?.video_url || ""}
                onChange={(e) =>
                  setLessonDialog((prev) => prev && { ...prev, video_url: e.target.value })
                }
                placeholder="YouTube, Vimeo, o URL directa"
              />
            </div>
            <div className="space-y-2">
              <Label>Duración (segundos)</Label>
              <Input
                type="number"
                value={lessonDialog?.duration_seconds || 0}
                onChange={(e) =>
                  setLessonDialog((prev) =>
                    prev && { ...prev, duration_seconds: parseInt(e.target.value) }
                  )
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLessonDialog(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveLesson}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Dialog */}
      <Dialog open={!!questionDialog} onOpenChange={() => setQuestionDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {questionDialog?.id ? "Editar Pregunta" : "Nueva Pregunta"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Pregunta *</Label>
              <Textarea
                value={questionDialog?.question_text || ""}
                onChange={(e) =>
                  setQuestionDialog((prev) =>
                    prev && { ...prev, question_text: e.target.value }
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Opciones *</Label>
              {questionDialog?.options?.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct"
                    checked={questionDialog.correct_answer_index === index}
                    onChange={() =>
                      setQuestionDialog((prev) =>
                        prev && { ...prev, correct_answer_index: index }
                      )
                    }
                    className="w-4 h-4 text-primary"
                  />
                  <Input
                    value={option}
                    onChange={(e) =>
                      setQuestionDialog((prev) => {
                        if (!prev) return prev;
                        const newOptions = [...(prev.options || [])];
                        newOptions[index] = e.target.value;
                        return { ...prev, options: newOptions };
                      })
                    }
                    placeholder={`Opción ${index + 1}`}
                  />
                  {(questionDialog?.options?.length || 0) > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setQuestionDialog((prev) => {
                          if (!prev) return prev;
                          const newOptions = (prev.options || []).filter(
                            (_, i) => i !== index
                          );
                          return { ...prev, options: newOptions };
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {(questionDialog?.options?.length || 0) < 6 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setQuestionDialog((prev) =>
                      prev && { ...prev, options: [...(prev.options || []), ""] }
                    )
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir opción
                </Button>
              )}
              <p className="text-xs text-gray-500">
                Selecciona la respuesta correcta con el radio button
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuestionDialog(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveQuestion}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
