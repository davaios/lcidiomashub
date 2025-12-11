import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { QuizQuestion } from "@/components/courses/QuizQuestion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Course, QuizQuestion as QuizQuestionType } from "@/types/database";

export function ExamPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [questions, setQuestions] = useState<QuizQuestionType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchExamData();
  }, [id]);

  const fetchExamData = async () => {
    if (!id) return;

    try {
      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("course_id", id)
        .order("order_index", { ascending: true });

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);
    } catch (error) {
      console.error("Error fetching exam:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (answerIndex: number) => {
    if (!questions[currentIndex]) return;
    setAnswers((prev) => ({
      ...prev,
      [questions[currentIndex].id]: answerIndex,
    }));
  };

  const handleSubmit = async () => {
    if (!user || !course || !id) return;

    setSubmitting(true);

    // Calculate score
    let correctCount = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer_index) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= course.passing_score;

    try {
      // Save attempt
      const { error } = await supabase.from("quiz_attempts").insert({
        user_id: user.id,
        course_id: id,
        score,
        passed,
        answers,
        attempted_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Navigate to results
      navigate(`/courses/${id}/results`, {
        state: { score, passed, passingScore: course.passing_score },
      });
    } catch (error) {
      console.error("Error submitting exam:", error);
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
  };

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!course || questions.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">
          Examen no disponible
        </h3>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Examen: {course.title}
        </h1>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Pregunta {currentIndex + 1} de {questions.length}
          </span>
          <span className="text-sm text-gray-500">
            Nota mínima: {course.passing_score}%
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question card */}
      <Card>
        <CardContent className="pt-6">
          <QuizQuestion
            question={currentQuestion}
            selectedAnswer={answers[currentQuestion.id] ?? null}
            onSelectAnswer={handleSelectAnswer}
          />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentIndex((prev) => prev - 1)}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Anterior
        </Button>

        {currentIndex < questions.length - 1 ? (
          <Button
            onClick={() => setCurrentIndex((prev) => prev + 1)}
            disabled={answers[currentQuestion.id] === undefined}
          >
            Siguiente
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={() => setShowConfirm(true)}
            disabled={answeredCount < questions.length}
          >
            Enviar examen
          </Button>
        )}
      </div>

      {/* Question indicators */}
      <div className="flex flex-wrap gap-2 justify-center">
        {questions.map((q, index) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(index)}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
              index === currentIndex
                ? "bg-primary text-white"
                : answers[q.id] !== undefined
                ? "bg-success text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Confirmation dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar envío</DialogTitle>
            <DialogDescription>
              Estás a punto de enviar tu examen. Esta acción no se puede deshacer.
              {answeredCount < questions.length && (
                <div className="flex items-center gap-2 mt-2 p-2 bg-accent-50 rounded-lg text-accent-700">
                  <AlertCircle className="h-4 w-4" />
                  <span>
                    Has respondido {answeredCount} de {questions.length} preguntas.
                  </span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Enviando..." : "Enviar examen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
